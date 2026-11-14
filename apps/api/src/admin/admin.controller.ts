import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "./admin.guard";
import {
  IngredientSearchQueryDto,
  ListRecipesQueryDto,
  UpsertRecipeDto,
} from "./admin.dto";
import { AdminService } from "./admin.service";

@Controller("admin")
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("recipes")
  list(@Query() query: ListRecipesQueryDto) {
    return this.admin.listRecipes(query);
  }

  @Get("ingredients")
  ingredients(@Query() query: IngredientSearchQueryDto) {
    return this.admin.searchIngredients(query.q ?? "", query.limit);
  }

  @Get("recipes/:id")
  get(@Param("id") id: string) {
    return this.admin.getRecipe(id);
  }

  @Post("recipes")
  create(@Body() dto: UpsertRecipeDto) {
    return this.admin.createRecipe(dto);
  }

  @Put("recipes/:id")
  update(@Param("id") id: string, @Body() dto: UpsertRecipeDto) {
    return this.admin.updateRecipe(id, dto);
  }

  @Delete("recipes/:id")
  remove(@Param("id") id: string) {
    return this.admin.deleteRecipe(id);
  }
}
