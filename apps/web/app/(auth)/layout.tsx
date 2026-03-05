import type { ReactNode } from "react";
import { RecaptchaProvider } from "@/_providers/recaptcha-provider";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <RecaptchaProvider>
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background to-default-100 p-4">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </RecaptchaProvider>
  );
}
