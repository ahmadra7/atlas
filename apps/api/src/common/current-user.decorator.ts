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
  (data: { optional?: boolean } | undefined, ctx: ExecutionContext): AuthUser | null => {
    const req = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (!req.user?.id) {
      if (data?.optional) return null;
      throw new UnauthorizedException("UNAUTHORIZED");
    }
    return req.user;
  },
);
