import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { ExecutionContext } from "@nestjs/common";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}

/** Lets guests hit an endpoint; attaches the user when a valid token exists. */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  override canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<{ headers?: { authorization?: string } }>();
    if (!req.headers?.authorization) {
      return true;
    }
    return super.canActivate(context);
  }

  override handleRequest<TUser>(err: Error | null, user: TUser) {
    if (err) return null as TUser;
    return user ?? (null as TUser);
  }
}
