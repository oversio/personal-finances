import { UseGuards } from "@nestjs/common";
import { RequiresVerifiedEmailGuard } from "../guards/requires-verified-email.guard";

export const RequiresVerifiedEmail = () => UseGuards(RequiresVerifiedEmailGuard);
