"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Link, Divider } from "@heroui/react";
import {
  loginSchema,
  type LoginFormData,
} from "@/(auth)/_schemas/login.schema";
import { loginApi, getGoogleAuthUrl } from "@/_commons/utils/auth-api";
import { useAuthStore } from "@/_commons/stores/auth.store";
import { GoogleIcon } from "./google-icon";
import { EyeIcon, EyeSlashIcon } from "./eye-icons";

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateField = (field: keyof LoginFormData, value: string) => {
    const result = loginSchema.shape[field].safeParse(value);
    if (!result.success) {
      setErrors(prev => ({
        ...prev,
        [field]: result.error.issues[0]?.message,
      }));
    } else {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleChange = (field: keyof LoginFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setApiError(null);
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof LoginFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginApi(result.data);
      setAuth(response.user, {
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
      });
      router.push("/dashboard");
    } catch {
      setApiError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    sessionStorage.setItem("redirectAfterAuth", "/dashboard");
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        type="email"
        label="Email"
        placeholder="Enter your email"
        value={formData.email}
        onValueChange={handleChange("email")}
        isInvalid={!!errors.email}
        errorMessage={errors.email}
        variant="bordered"
        isRequired
        autoComplete="email"
      />

      <Input
        type={isPasswordVisible ? "text" : "password"}
        label="Password"
        placeholder="Enter your password"
        value={formData.password}
        onValueChange={handleChange("password")}
        isInvalid={!!errors.password}
        errorMessage={errors.password}
        variant="bordered"
        isRequired
        autoComplete="current-password"
        endContent={
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="focus:outline-none"
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          >
            {isPasswordVisible ? (
              <EyeSlashIcon className="text-2xl text-default-400" />
            ) : (
              <EyeIcon className="text-2xl text-default-400" />
            )}
          </button>
        }
      />

      {apiError && <p className="text-small text-danger">{apiError}</p>}

      <Button
        type="submit"
        color="primary"
        isLoading={isLoading}
        className="mt-2"
      >
        Sign In
      </Button>

      <Divider className="my-4" />

      <Button
        type="button"
        variant="bordered"
        startContent={<GoogleIcon className="text-xl" />}
        onPress={handleGoogleLogin}
      >
        Continue with Google
      </Button>

      <p className="mt-4 text-center text-small text-default-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" size="sm">
          Sign up
        </Link>
      </p>
    </form>
  );
}
