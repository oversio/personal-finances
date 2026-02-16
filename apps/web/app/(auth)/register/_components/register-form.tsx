"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Link, Divider } from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useServerFormValidationErrors } from "@/_commons/api";
import { useRecaptcha } from "@/_commons/hooks";
import { useAuthStore } from "@/_commons/stores/auth.store";

import { GoogleIcon } from "../../login/_components/google-icon";
import { EyeIcon, EyeSlashIcon } from "../../login/_components/eye-icons";
import { useRegister } from "@/(auth)/register/_api/use-register";
import { getGoogleAuthUrl } from "@/(auth)/_api/auth.constants";
import { RegisterFormData, registerSchema } from "../_schemas/register.schema";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore(state => state.setAuth);

  const redirectTo = searchParams.get("redirect") || "/workspace-redirect";

  const form = useForm<RegisterFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(registerSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const { mutate: registerMutation, isPending, error } = useRegister();
  const { getToken } = useRecaptcha();

  // Auto-apply server validation errors to form fields
  const generalError = useServerFormValidationErrors(form, error);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const onSubmit = async (data: RegisterFormData) => {
    const recaptchaToken = await getToken("register");
    registerMutation(
      { ...data, recaptchaToken },
      {
        onSuccess: response => {
          setAuth(response.user, {
            accessToken: response.tokens.accessToken,
            refreshToken: response.tokens.refreshToken,
          });
          router.push(redirectTo);
        },
      },
    );
  };

  const handleGoogleSignup = () => {
    sessionStorage.setItem("redirectAfterAuth", redirectTo);
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        type="text"
        label="Nombre"
        placeholder="Ingresa tu nombre"
        {...register("name")}
        isInvalid={!!errors.name}
        errorMessage={errors.name?.message}
        variant="flat"
        isRequired
        autoComplete="name"
      />

      <Input
        type="email"
        label="Correo electrónico"
        placeholder="Ingresa tu correo"
        {...register("email")}
        isInvalid={!!errors.email}
        errorMessage={errors.email?.message}
        variant="flat"
        isRequired
        autoComplete="email"
      />

      <Input
        type={isPasswordVisible ? "text" : "password"}
        label="Contraseña"
        placeholder="Crea una contraseña"
        {...register("password")}
        isInvalid={!!errors.password}
        errorMessage={errors.password?.message}
        description="Mínimo 8 caracteres con mayúscula, minúscula y número"
        variant="flat"
        isRequired
        autoComplete="new-password"
        endContent={
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="focus:outline-none"
            aria-label={isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
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
        Crear Cuenta
      </Button>

      <Divider className="my-4" />

      <Button
        type="button"
        variant="flat"
        startContent={<GoogleIcon className="text-xl" />}
        onPress={handleGoogleSignup}
      >
        Registrarse con Google
      </Button>

      <p className="mt-4 text-center text-small text-default-500">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" size="sm">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
