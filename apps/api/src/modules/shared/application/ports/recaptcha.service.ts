export const RECAPTCHA_SERVICE = Symbol("RECAPTCHA_SERVICE");

export interface RecaptchaVerifyResult {
  success: boolean;
  score: number;
  action: string;
}

export interface RecaptchaService {
  verify(token: string, expectedAction: string): Promise<RecaptchaVerifyResult>;
  isEnabled(): boolean;
}
