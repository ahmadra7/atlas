import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (!req.user?.id) {
      throw new UnauthorizedException("UNAUTHORIZED");
    }
    return req.user;
  },
);
