"use client";

import { Card, CardHeader, CardBody } from "@heroui/react";
import { RegisterForm } from "./_components/register-form";

export default function RegisterPage() {
  return (
    <Card className="p-4 shadow-lg">
      <CardHeader className="flex flex-col gap-1 pb-0">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-small text-default-500">Sign up to start managing your finances</p>
      </CardHeader>
      <CardBody>
        <RegisterForm />
      </CardBody>
    </Card>
  );
}
