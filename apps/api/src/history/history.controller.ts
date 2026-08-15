import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../common/current-user.decorator";
import { HistoryService } from "./history.service";

@Controller("history")
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private readonly history: HistoryService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.history.list(user.id);
  }
}
