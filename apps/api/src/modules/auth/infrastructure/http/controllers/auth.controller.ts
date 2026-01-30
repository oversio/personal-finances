import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import {
  GoogleAuthCommand,
  GoogleAuthHandler,
  LoginCommand,
  LoginHandler,
  LogoutCommand,
  LogoutHandler,
  RefreshTokenCommand,
  RefreshTokenHandler,
  RegisterCommand,
  RegisterHandler,
} from "../../../application";
import { CurrentUser } from "../../decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../decorators/current-user.decorator";
import { Public } from "../../decorators/public.decorator";
import { GoogleAuthGuard } from "../../guards/google-auth.guard";
import type { GoogleProfile } from "../../strategies/google.strategy";
import { LoginDto, LogoutDto, RefreshTokenDto, RegisterDto } from "../dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly registerHandler: RegisterHandler,
    private readonly loginHandler: LoginHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
    private readonly googleAuthHandler: GoogleAuthHandler,
    private readonly logoutHandler: LogoutHandler,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 409, description: "User already exists" })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const command = new RegisterCommand(dto.email, dto.password, dto.name);
    const result = await this.registerHandler.execute(command, {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    // Set cookies for persistence (consistent with OAuth flow)
    this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    return result;
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with email and password" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const command = new LoginCommand(dto.email, dto.password);
    const result = await this.loginHandler.execute(command, {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    // Set cookies for persistence (consistent with OAuth flow)
    this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    return result;
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  @ApiResponse({ status: 401, description: "Invalid refresh token" })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const command = new RefreshTokenCommand(dto.refreshToken);
    return this.refreshTokenHandler.execute(command, {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Logout (revoke refresh token)" })
  @ApiResponse({ status: 204, description: "Logged out successfully" })
  async logout(@Body() dto: LogoutDto, @CurrentUser() user: AuthenticatedUser) {
    const command = new LogoutCommand(dto.refreshToken, dto.logoutAll, user.id);
    await this.logoutHandler.execute(command);
  }

  @Public()
  @Get("google")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Initiate Google OAuth flow" })
  googleAuth() {
    // Guard handles redirect to Google
  }

  @Public()
  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Google OAuth callback" })
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const profile = req.user as GoogleProfile;
    const command = new GoogleAuthCommand(profile.id, profile.email, profile.name, profile.picture);

    const result = await this.googleAuthHandler.execute(command, {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    // Set cookies for persistence
    this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    // Redirect to frontend callback (frontend handles internal redirect via sessionStorage)
    const frontendUrl = this.configService.get<string>("FRONTEND_URL");
    res.redirect(`${frontendUrl}/oauth/callback`);
  }

  @Get("me")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "User profile" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  /**
   * Set auth cookies for token persistence
   * Cookies are readable by frontend so it can send tokens via Authorization header
   */
  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProduction = this.configService.get("NODE_ENV") === "production";
    const cookieOptions = {
      httpOnly: false, // Frontend needs to read tokens to send via Authorization header
      secure: isProduction,
      sameSite: "lax" as const,
      path: "/",
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
