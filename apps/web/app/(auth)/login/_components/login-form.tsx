"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Link, Divider } from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useServerFormValidationErrors } from "@/_commons/api";
import { useAuthStore } from "@/_commons/stores/auth.store";
import { GoogleIcon } from "./google-icon";
import { EyeIcon, EyeSlashIcon } from "./eye-icons";
import { useLogin } from "../_api/use-login";
import { getGoogleAuthUrl } from "@/(auth)/_api/auth.constants";
import { LoginFormData, loginSchema } from "../_schemas/login.schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore(state => state.setAuth);

  const redirectTo = searchParams.get("redirect") || "/workspace-redirect";

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const { mutate: loginMutation, isPending, error } = useLogin();

  // Auto-apply server validation errors to form fields
  const generalError = useServerFormValidationErrors(form, error);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const onSubmit = (data: LoginFormData) => {
    loginMutation(data, {
      onSuccess: response => {
        setAuth(response.user, {
          accessToken: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken,
        });
        router.push(redirectTo);
      },
    });
  };

  const handleGoogleLogin = () => {
    sessionStorage.setItem("redirectAfterAuth", redirectTo);
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        type="email"
        label="Email"
        placeholder="Enter your email"
        {...register("email")}
        isInvalid={!!errors.email}
        errorMessage={errors.email?.message}
        variant="flat"
        isRequired
        autoComplete="email"
      />

      <Input
        type={isPasswordVisible ? "text" : "password"}
        label="Password"
        placeholder="Enter your password"
        {...register("password")}
        isInvalid={!!errors.password}
        errorMessage={errors.password?.message}
        variant="flat"
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

      {generalError && <p className="text-small text-danger">{generalError}</p>}

      <Button type="submit" color="primary" isLoading={isPending} className="mt-2">
        Sign In
      </Button>

      <Divider className="my-4" />

      <Button
        type="button"
        variant="flat"
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
