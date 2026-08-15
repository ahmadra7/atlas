import { Controller, Get, Query } from "@nestjs/common";
import { IngredientsService } from "./ingredients.service";

@Controller("ingredients")
export class IngredientsController {
  constructor(private readonly ingredients: IngredientsService) {}

  @Get("search")
  search(@Query("q") q = "", @Query("limit") limit?: string) {
    return this.ingredients.search(q, limit ? Number(limit) : 20);
  }
}
