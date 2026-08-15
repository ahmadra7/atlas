import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException("INVALID_CREDENTIALS");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("INVALID_CREDENTIALS");

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        dietaryPreferences: user.dietaryPreferences,
        defaultMaxMinutes: user.defaultMaxMinutes,
        locale: "fa" as const,
      },
    };
  }

  async register(email: string, password: string, displayName: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new UnauthorizedException("EMAIL_TAKEN");
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.create({
      email,
      passwordHash,
      displayName,
    });
    return this.login(user.email, password);
  }
}
