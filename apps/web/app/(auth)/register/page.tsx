"use client";

import { Suspense } from "react";
import Image from "next/image";
import { Card, CardHeader, CardBody, Spinner } from "@heroui/react";
import { RegisterForm } from "./_components/register-form";

export default function RegisterPage() {
  return (
    <Card className="p-4 shadow-lg">
      <CardHeader className="flex flex-col items-center gap-4 pb-0">
        <Image src="/omaf-dark.png" alt="OMA Finance" width={150} height={32} priority />
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-bold">Crear una cuenta</h1>
          <p className="text-small text-default-500">Regístrate para gestionar tus finanzas</p>
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
          <RegisterForm />
        </Suspense>
      </CardBody>
    </Card>
  );
}
