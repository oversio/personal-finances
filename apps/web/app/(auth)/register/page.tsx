"use client";

import { Suspense } from "react";
import { Card, CardHeader, CardBody, Spinner } from "@heroui/react";
import { RegisterForm } from "./_components/register-form";

export default function RegisterPage() {
  return (
    <Card className="p-4 shadow-lg">
      <CardHeader className="flex flex-col gap-1 pb-0">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-small text-default-500">Sign up to start managing your finances</p>
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
