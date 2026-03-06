import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { EmailNotVerifiedError } from "../../domain/exceptions";
import type { AuthenticatedUser } from "../decorators/current-user.decorator";

@Injectable()
export class RequiresVerifiedEmailGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    const user = request.user;

    if (!user?.isEmailVerified) {
      throw new EmailNotVerifiedError();
    }

    return true;
  }
}
