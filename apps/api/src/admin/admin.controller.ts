import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
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

  @Post("uploads/image")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
          cb(new Error("فقط فایل تصویر مجاز است."), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.admin.uploadRecipeImage(file);
  }

  @Get("recipes")
  list(@Query() query: ListRecipesQueryDto) {
    return this.admin.listRecipes(query);
  }

  @Get("ingredients")
  ingredients(@Query() query: IngredientSearchQueryDto) {
    return this.admin.searchIngredients(query.q ?? "", query.limit);
  }

  @Get("taxonomy")
  taxonomy() {
    return this.admin.getTaxonomy();
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

  @Post("recipes/:id/restore")
  restore(@Param("id") id: string) {
    return this.admin.restoreRecipe(id);
  }
}
