import { Controller, Get, Param, Query } from "@nestjs/common";
import { RecipesService } from "./recipes.service";

@Controller("recipes")
export class RecipesController {
  constructor(private readonly recipes: RecipesService) {}

  @Get()
  list(@Query("q") q?: string, @Query("limit") limit?: string) {
    if (q?.trim()) {
      return this.recipes.search(q, limit ? Number(limit) : 40);
    }
    return this.recipes.listPublished();
  }

  @Get(":slug")
  async bySlug(@Param("slug") slug: string) {
    return this.recipes.getBySlug(slug);
  }
}
