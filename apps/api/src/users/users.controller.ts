import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../common/current-user.decorator";
import { UsersService } from "./users.service";

@Controller("profile")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async me(@CurrentUser() auth: AuthUser) {
    const user = await this.users.findById(auth.id);
    if (!user) return null;
    return this.users.toProfile(user);
  }
}
