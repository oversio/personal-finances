"use client";

import { Suspense } from "react";
import Image from "next/image";
import { Card, CardHeader, CardBody, Spinner } from "@heroui/react";
import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
  return (
    <Card className="p-4 shadow-lg">
      <CardHeader className="flex flex-col items-center gap-4 pb-0">
        <Image src="/logo.png" alt="OMA Finance" width={140} height={48} priority />
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-bold">Bienvenido de nuevo</h1>
          <p className="text-small text-default-500">Inicia sesión para continuar</p>
        </div>
      </CardHeader>
      <CardBody>
        <Suspense
          fallback={
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </CardBody>
    </Card>
  );
}
