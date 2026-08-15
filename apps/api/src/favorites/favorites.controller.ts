import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { IsString } from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../common/current-user.decorator";
import { FavoritesService } from "./favorites.service";

class ToggleDto {
  @IsString()
  recipeId!: string;
}

@Controller("favorites")
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.favorites.list(user.id);
  }

  @Post("toggle")
  toggle(@CurrentUser() user: AuthUser, @Body() body: ToggleDto) {
    return this.favorites.toggle(user.id, body.recipeId);
  }
}
