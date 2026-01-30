import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>("GOOGLE_CLIENT_ID"),
      clientSecret: configService.getOrThrow<string>("GOOGLE_CLIENT_SECRET"),
      callbackURL: configService.getOrThrow<string>("GOOGLE_CALLBACK_URL"),
      scope: ["email", "profile"],
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      emails?: Array<{ value: string }>;
      displayName?: string;
      name?: { givenName?: string; familyName?: string };
      photos?: Array<{ value: string }>;
    },
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    const name =
      profile.displayName ||
      [profile.name?.givenName, profile.name?.familyName].filter(Boolean).join(" ") ||
      "User";
    const picture = profile.photos?.[0]?.value;

    if (!email) {
      done(new Error("No email provided by Google"), undefined);
      return;
    }

    const googleProfile: GoogleProfile = {
      id: profile.id,
      email,
      name,
      picture,
    };

    done(null, googleProfile);
  }
}
