import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import type { RecommendationFilters } from "@atlas/contracts";
import { OptionalJwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../common/current-user.decorator";
import { RecommendationsService } from "./recommendations.service";

@Controller("recommendations")
@UseGuards(OptionalJwtAuthGuard)
export class RecommendationsController {
  constructor(private readonly recommendations: RecommendationsService) {}

  @Get()
  list(
    @CurrentUser({ optional: true }) user: AuthUser | null,
    @Query() query: Record<string, string>,
  ) {
    const filters: RecommendationFilters = {
      meal: query.meal as RecommendationFilters["meal"],
      maxMinutes: query.maxMinutes ? Number(query.maxMinutes) : undefined,
      difficulty: query.difficulty as RecommendationFilters["difficulty"],
      budgetFriendly: query.budgetFriendly === "1" || query.budgetFriendly === "true",
      cuisine: query.cuisine,
      dietMode: query.dietMode as RecommendationFilters["dietMode"],
      dishType: query.dishType as RecommendationFilters["dishType"],
      dietaryTags: query.tags
        ? query.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined,
      ingredients: query.ingredients
        ? query.ingredients.split("|").map((t) => t.trim()).filter(Boolean)
        : undefined,
    };
    return this.recommendations.recommend(user?.id ?? null, filters);
  }
}
