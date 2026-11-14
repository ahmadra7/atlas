import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected =
      this.config.get<string>("ADMIN_SECRET")?.trim() || "atlas-local-admin";
    const request = context.switchToHttp().getRequest<Request>();
    const provided = String(request.headers["x-admin-secret"] ?? "");
    if (!provided || provided !== expected) {
      throw new UnauthorizedException("ADMIN_UNAUTHORIZED");
    }
    return true;
  }
}
