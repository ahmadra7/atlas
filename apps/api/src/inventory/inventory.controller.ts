import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { IsOptional, IsString, MinLength } from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../common/current-user.decorator";
import { InventoryService } from "./inventory.service";

class AddIngredientDto {
  @IsOptional()
  @IsString()
  ingredientId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;
}

class SpeechDto {
  @IsString()
  @MinLength(1)
  transcript!: string;
}

@Controller("inventory")
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.inventory.list(user.id);
  }

  @Post()
  add(@CurrentUser() user: AuthUser, @Body() body: AddIngredientDto) {
    if (body.ingredientId) {
      return this.inventory.addByIngredientId(user.id, body.ingredientId);
    }
    if (body.name) {
      return this.inventory.addByName(user.id, body.name);
    }
    throw new BadRequestException("ingredientId_or_name_required");
  }

  @Post("speech")
  fromSpeech(@CurrentUser() user: AuthUser, @Body() body: SpeechDto) {
    return this.inventory.addFromSpeech(user.id, body.transcript);
  }

  @Post("speech/resolve")
  resolveSpeech(@Body() body: SpeechDto) {
    return this.inventory.resolveSpokenNames(body.transcript);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.inventory.remove(user.id, id);
  }
}
