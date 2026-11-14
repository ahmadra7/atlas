import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

export class ListRecipesQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsIn(["all", "published", "draft"])
  status?: "all" | "published" | "draft";
}

export class AdminIngredientLineDto {
  @IsOptional()
  @IsString()
  ingredientId?: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  quantity?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsBoolean()
  optional?: boolean;
}

export class AdminStepLineDto {
  @IsString()
  @MinLength(1)
  instruction!: string;

  @IsOptional()
  @IsString()
  tip?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  timerSeconds?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpsertRecipeDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  description!: string;

  @IsString()
  @MinLength(1)
  category!: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsIn(["breakfast", "lunch", "dinner", "snack", "any"])
  meal!: "breakfast" | "lunch" | "dinner" | "snack" | "any";

  @IsString()
  @MinLength(1)
  cuisine!: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsIn(["easy", "medium", "hard"])
  difficulty!: "easy" | "medium" | "hard";

  @Type(() => Number)
  @IsInt()
  @Min(0)
  prepMinutes!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  cookMinutes!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalMinutes?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  servings!: number;

  @IsString()
  imageUrl!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  caloriesPerServing?: number;

  @IsOptional()
  @IsString()
  cookingMethod?: string;

  @IsArray()
  @IsString({ each: true })
  dietaryTags!: string[];

  @IsBoolean()
  budgetFriendly!: boolean;

  @IsBoolean()
  verified!: boolean;

  @IsBoolean()
  published!: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdminIngredientLineDto)
  ingredients!: AdminIngredientLineDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdminStepLineDto)
  steps!: AdminStepLineDto[];
}

export class IngredientSearchQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(40)
  limit?: number;
}
