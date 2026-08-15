import { Body, Controller, Post } from "@nestjs/common";
import { IsEmail, IsString, MinLength } from "class-validator";
import { AuthService } from "./auth.service";

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(4)
  password!: string;
}

class RegisterDto extends LoginDto {
  @IsString()
  @MinLength(2)
  displayName!: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }

  @Post("register")
  register(@Body() body: RegisterDto) {
    return this.auth.register(body.email, body.password, body.displayName);
  }
}
