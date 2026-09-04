import { Controller, Get, Param, Query } from "@nestjs/common";
import { RecipesService } from "./recipes.service";

@Controller("recipes")
export class RecipesController {
  constructor(private readonly recipes: RecipesService) {}

  @Get()
  list(@Query("q") q?: string, @Query("limit") limit?: string) {
    const take = limit ? Number(limit) : undefined;
    if (q?.trim()) {
      return this.recipes.search(q, take ?? 40);
    }
    return this.recipes.listForRecommend({}, take && take > 0 ? take : 80);
  }

  @Get(":slug")
  async bySlug(@Param("slug") slug: string) {
    return this.recipes.getBySlug(slug);
  }
}
