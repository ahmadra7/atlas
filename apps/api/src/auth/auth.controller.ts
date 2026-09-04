import { Body, Controller, Get, Post } from "@nestjs/common";
import { IsEmail, IsOptional, IsString, Matches, MinLength } from "class-validator";
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

class RequestOtpDto {
  @IsString()
  phone!: string;
}

class VerifyOtpDto {
  @IsString()
  phone!: string;

  @IsString()
  @Matches(/^\d{5}$/)
  code!: string;
}

class GoogleAuthDto {
  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  idToken?: string;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
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

  @Post("otp/request")
  requestOtp(@Body() body: RequestOtpDto) {
    return this.auth.requestOtp(body.phone);
  }

  @Post("otp/verify")
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.auth.verifyOtp(body.phone, body.code);
  }

  @Get("google/config")
  googleConfig() {
    return {
      clientId: (
        process.env.GOOGLE_CLIENT_ID ||
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        ""
      ).trim(),
    };
  }

  @Post("google")
  google(@Body() body: GoogleAuthDto) {
    return this.auth.loginWithGoogle(body);
  }
}
