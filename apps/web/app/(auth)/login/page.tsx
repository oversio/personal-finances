"use client";

import { Card, CardHeader, CardBody } from "@heroui/react";
import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
  return (
    <Card className="p-4 shadow-lg">
      <CardHeader className="flex flex-col gap-1 pb-0">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-small text-default-500">
          Sign in to continue to Personal Finances
        </p>
      </CardHeader>
      <CardBody>
        <LoginForm />
      </CardBody>
    </Card>
  );
}
