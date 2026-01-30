"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Link, Divider } from "@heroui/react";
import { registerSchema, type RegisterFormData } from "@/(auth)/_schemas/register.schema";
import { registerApi, getGoogleAuthUrl } from "@/_commons/utils/auth-api";
import { useAuthStore } from "@/_commons/stores/auth.store";
import { GoogleIcon } from "../../login/_components/google-icon";
import { EyeIcon, EyeSlashIcon } from "../../login/_components/eye-icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(registerSchema),
  });

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await registerApi(data);
      setAuth(response.user, {
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
      });
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error && error.message.includes("409")) {
        setError("email", {
          type: "manual",
          message: "An account with this email already exists.",
        });
      } else {
        setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        });
      }
    }
  };

  const handleGoogleSignup = () => {
    sessionStorage.setItem("redirectAfterAuth", "/dashboard");
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        type="text"
        label="Name"
        placeholder="Enter your name"
        {...register("name")}
        isInvalid={!!errors.name}
        errorMessage={errors.name?.message}
        variant="bordered"
        isRequired
        autoComplete="name"
      />

      <Input
        type="email"
        label="Email"
        placeholder="Enter your email"
        {...register("email")}
        isInvalid={!!errors.email}
        errorMessage={errors.email?.message}
        variant="bordered"
        isRequired
        autoComplete="email"
      />

      <Input
        type={isPasswordVisible ? "text" : "password"}
        label="Password"
        placeholder="Create a password"
        {...register("password")}
        isInvalid={!!errors.password}
        errorMessage={errors.password?.message}
        description="At least 8 characters with uppercase, lowercase, and number"
        variant="bordered"
        isRequired
        autoComplete="new-password"
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

      {errors.root && <p className="text-small text-danger">{errors.root.message}</p>}

      <Button type="submit" color="primary" isLoading={isSubmitting} className="mt-2">
        Create Account
      </Button>

      <Divider className="my-4" />

      <Button
        type="button"
        variant="bordered"
        startContent={<GoogleIcon className="text-xl" />}
        onPress={handleGoogleSignup}
      >
        Sign up with Google
      </Button>

      <p className="mt-4 text-center text-small text-default-500">
        Already have an account?{" "}
        <Link href="/login" size="sm">
          Sign in
        </Link>
      </p>
    </form>
  );
}
