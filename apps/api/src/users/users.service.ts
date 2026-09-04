import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  create(data: {
    email: string;
    passwordHash: string;
    displayName: string;
    phone?: string | null;
    googleId?: string | null;
    avatarUrl?: string | null;
    authProvider?: string;
    dietaryPreferences?: string[];
    defaultMaxMinutes?: number | null;
  }) {
    return this.prisma.user.create({ data });
  }

  updateGoogleIdentity(
    id: string,
    data: {
      displayName?: string;
      avatarUrl?: string | null;
      googleId?: string | null;
      authProvider?: string;
    },
  ) {
    return this.prisma.user.update({ where: { id }, data });
  }

  toProfile(user: {
    id: string;
    displayName: string;
    dietaryPreferences: unknown;
    defaultMaxMinutes: number | null;
    avatarUrl?: string | null;
    phone?: string | null;
    email?: string | null;
    authProvider?: string | null;
  }) {
    const prefs = Array.isArray(user.dietaryPreferences)
      ? user.dietaryPreferences.map(String)
      : [];
    const provider =
      user.authProvider === "google" || user.authProvider === "phone"
        ? user.authProvider
        : "password";
    return {
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl ?? null,
      phone: user.phone ?? null,
      email: user.email ?? null,
      provider,
      dietaryPreferences: prefs,
      defaultMaxMinutes: user.defaultMaxMinutes ?? undefined,
      locale: "fa" as const,
    };
  }
}
