import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { IngredientsModule } from "./ingredients/ingredients.module";
import { InventoryModule } from "./inventory/inventory.module";
import { RecipesModule } from "./recipes/recipes.module";
import { RecommendationsModule } from "./recommendations/recommendations.module";
import { CookingModule } from "./cooking/cooking.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { HistoryModule } from "./history/history.module";
import { AdminModule } from "./admin/admin.module";
import { HealthController } from "./health.controller";
import { TtsController } from "./tts.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    IngredientsModule,
    InventoryModule,
    RecipesModule,
    RecommendationsModule,
    CookingModule,
    FavoritesModule,
    HistoryModule,
    AdminModule,
  ],
  controllers: [HealthController, TtsController],
})
export class AppModule {}
