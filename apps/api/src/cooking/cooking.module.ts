import { Module } from "@nestjs/common";
import { CookingService } from "./cooking.service";
import { CookingController } from "./cooking.controller";
import { RecipesModule } from "../recipes/recipes.module";

@Module({
  imports: [RecipesModule],
  providers: [CookingService],
  controllers: [CookingController],
  exports: [CookingService],
})
export class CookingModule {}
