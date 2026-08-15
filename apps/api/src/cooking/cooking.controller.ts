import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { IsInt, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../common/current-user.decorator";
import { CookingService } from "./cooking.service";

class StartDto {
  @IsString()
  recipeId!: string;
}

class CompleteStepDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stepOrder!: number;
}

@Controller("cooking")
@UseGuards(JwtAuthGuard)
export class CookingController {
  constructor(private readonly cooking: CookingService) {}

  @Post("sessions")
  start(@CurrentUser() user: AuthUser, @Body() body: StartDto) {
    return this.cooking.start(user.id, body.recipeId);
  }

  @Get("sessions/:id")
  get(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.cooking.get(user.id, id);
  }

  @Post("sessions/:id/complete-step")
  completeStep(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() body: CompleteStepDto,
  ) {
    return this.cooking.completeStep(user.id, id, body.stepOrder);
  }

  @Post("sessions/:id/complete")
  complete(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.cooking.complete(user.id, id);
  }

  @Post("sessions/:id/abandon")
  abandon(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.cooking.abandon(user.id, id);
  }
}
