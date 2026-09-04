import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { randomBytes, randomInt } from "crypto";
import { UsersService } from "../users/users.service";

type OtpEntry = {
  hash: string;
  expiresAt: number;
  attempts: number;
  sentAt: number;
};

function normalizeIranMobile(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  let n = digits;
  if (n.startsWith("0098")) n = n.slice(4);
  else if (n.startsWith("98")) n = n.slice(2);
  if (n.startsWith("0")) n = n.slice(1);
  if (n.length !== 10 || !n.startsWith("9")) return null;
  return `0${n}`;
}

@Injectable()
export class AuthService {
  private readonly otps = new Map<string, OtpEntry>();

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  private async issueSession(user: {
    id: string;
    email: string;
    displayName: string;
    dietaryPreferences: unknown;
    defaultMaxMinutes: number | null;
    avatarUrl?: string | null;
    phone?: string | null;
    authProvider?: string | null;
  }) {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
    });
    return {
      accessToken,
      user: this.users.toProfile(user),
    };
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException("INVALID_CREDENTIALS");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("INVALID_CREDENTIALS");
    return this.issueSession(user);
  }

  async register(email: string, password: string, displayName: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new UnauthorizedException("EMAIL_TAKEN");
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.create({
      email,
      passwordHash,
      displayName,
      authProvider: "password",
    });
    return this.login(user.email, password);
  }

  async requestOtp(phoneRaw: string) {
    const phone = normalizeIranMobile(phoneRaw);
    if (!phone) throw new UnauthorizedException("INVALID_PHONE");
    const prev = this.otps.get(phone);
    const now = Date.now();
    if (prev && now - prev.sentAt < 60_000) {
      throw new HttpException("OTP_RATE_LIMIT", HttpStatus.TOO_MANY_REQUESTS);
    }
    const code = String(randomInt(10000, 100000));
    const hash = await bcrypt.hash(code, 8);
    this.otps.set(phone, {
      hash,
      expiresAt: now + 5 * 60_000,
      attempts: 0,
      sentAt: now,
    });
    const debug =
      process.env.NODE_ENV !== "production" || process.env.ATLAS_OTP_DEBUG === "1";
    return {
      sent: true as const,
      expiresInSec: 300,
      resendInSec: 90,
      ...(debug ? { debugCode: code } : {}),
    };
  }

  async verifyOtp(phoneRaw: string, code: string) {
    const phone = normalizeIranMobile(phoneRaw);
    if (!phone) throw new UnauthorizedException("INVALID_PHONE");
    const entry = this.otps.get(phone);
    if (!entry) throw new UnauthorizedException("OTP_NOT_FOUND");
    if (Date.now() > entry.expiresAt) {
      this.otps.delete(phone);
      throw new UnauthorizedException("OTP_EXPIRED");
    }
    entry.attempts += 1;
    if (entry.attempts > 5) {
      this.otps.delete(phone);
      throw new UnauthorizedException("OTP_LOCKED");
    }
    const ok = await bcrypt.compare(code.trim(), entry.hash);
    if (!ok) throw new UnauthorizedException("OTP_INVALID");
    this.otps.delete(phone);

    const existing = await this.users.findByPhone(phone);
    if (existing) return this.issueSession(existing);

    const email = `otp.${phone}@atlas.local`;
    const passwordHash = await bcrypt.hash(randomBytes(24).toString("hex"), 10);
    const user = await this.users.create({
      email,
      passwordHash,
      displayName: "",
      phone,
      authProvider: "phone",
    });
    return this.issueSession(user);
  }

  async loginWithGoogle(input: {
    accessToken?: string;
    googleId?: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string | null;
  }) {
    let googleId = input.googleId?.trim();
    let email = input.email?.trim().toLowerCase();
    let displayName = input.displayName?.trim() ?? "";
    let avatarUrl = input.avatarUrl ?? null;

    if (input.accessToken) {
      const token = input.accessToken;
      const [tokenInfoRes, userInfoRes, peopleRes] = await Promise.all([
        fetch(
          `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(token)}`,
        ),
        fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos",
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      ]);

      if (!userInfoRes.ok) throw new UnauthorizedException("GOOGLE_PROFILE");
      const info = (await userInfoRes.json()) as {
        sub?: string;
        email?: string;
        name?: string;
        given_name?: string;
        picture?: string;
      };

      if (tokenInfoRes.ok) {
        const tokenInfo = (await tokenInfoRes.json()) as {
          aud?: string;
          sub?: string;
          email?: string;
        };
        const expectedAud = process.env.GOOGLE_CLIENT_ID?.trim();
        if (expectedAud && tokenInfo.aud && tokenInfo.aud !== expectedAud) {
          throw new UnauthorizedException("GOOGLE_TOKEN");
        }
        googleId = tokenInfo.sub?.trim() || googleId;
        email = tokenInfo.email?.trim().toLowerCase() || email;
      }

      let peopleName = "";
      let peoplePhoto: string | null = null;
      let peopleEmail = "";
      if (peopleRes.ok) {
        const people = (await peopleRes.json()) as {
          names?: Array<{ displayName?: string; givenName?: string }>;
          emailAddresses?: Array<{ value?: string }>;
          photos?: Array<{ url?: string }>;
        };
        peopleName =
          people.names?.[0]?.displayName?.trim() ||
          people.names?.[0]?.givenName?.trim() ||
          "";
        peopleEmail = people.emailAddresses?.[0]?.value?.trim().toLowerCase() || "";
        peoplePhoto =
          people.photos?.[0]?.url?.replace(/=s\d+([?-]|$)/, "=s256$1")?.trim() ||
          null;
      }

      googleId = info.sub?.trim() || googleId;
      email = info.email?.trim().toLowerCase() || peopleEmail || email;
      displayName =
        peopleName || info.name?.trim() || info.given_name?.trim() || displayName;
      avatarUrl = peoplePhoto || info.picture?.trim() || avatarUrl;
    }

    if (!googleId || !email) throw new UnauthorizedException("GOOGLE_PROFILE");

    const byGoogle = await this.users.findByGoogleId(googleId);
    if (byGoogle) {
      const updated = await this.users.updateGoogleIdentity(byGoogle.id, {
        displayName: displayName || byGoogle.displayName,
        avatarUrl: avatarUrl ?? byGoogle.avatarUrl,
        googleId,
        authProvider: "google",
      });
      return this.issueSession(updated);
    }
    const byEmail = await this.users.findByEmail(email);
    if (byEmail) {
      const updated = await this.users.updateGoogleIdentity(byEmail.id, {
        displayName: displayName || byEmail.displayName,
        avatarUrl: avatarUrl ?? byEmail.avatarUrl,
        googleId,
        authProvider: "google",
      });
      return this.issueSession(updated);
    }

    const passwordHash = await bcrypt.hash(randomBytes(24).toString("hex"), 10);
    const user = await this.users.create({
      email,
      passwordHash,
      displayName,
      googleId,
      avatarUrl,
      authProvider: "google",
    });
    return this.issueSession(user);
  }
}
