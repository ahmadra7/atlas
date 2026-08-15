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

  create(data: {
    email: string;
    passwordHash: string;
    displayName: string;
    dietaryPreferences?: string[];
    defaultMaxMinutes?: number | null;
  }) {
    return this.prisma.user.create({ data });
  }

  toProfile(user: {
    id: string;
    displayName: string;
    dietaryPreferences: unknown;
    defaultMaxMinutes: number | null;
  }) {
    const prefs = Array.isArray(user.dietaryPreferences)
      ? user.dietaryPreferences.map(String)
      : [];
    return {
      id: user.id,
      displayName: user.displayName,
      dietaryPreferences: prefs,
      defaultMaxMinutes: user.defaultMaxMinutes ?? undefined,
      locale: "fa" as const,
    };
  }
}
