"use client";

import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCreateAccount } from "../_api/use-create-account";
import { AccountForm } from "../_components/account-form";
import type { CreateAccountFormData } from "../_schemas/account.schema";

export default function NewAccountPage() {
  const params = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const workspaceId = params.workspaceId;

  const { mutate: createAccount, isPending, error } = useCreateAccount();

  const handleSubmit = (data: CreateAccountFormData) => {
    createAccount(
      { workspaceId, data },
      {
        onSuccess: () => {
          router.push(`/ws/${workspaceId}/accounts`);
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center gap-4">
        <Button as={Link} href={`/ws/${workspaceId}/accounts`} variant="light" isIconOnly>
          <svg
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Account</h1>
          <p className="text-default-500">Create a new financial account</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Account Details</h2>
        </CardHeader>
        <CardBody>
          <AccountForm onSubmit={handleSubmit} isPending={isPending} error={error} />
        </CardBody>
      </Card>
    </div>
  );
}
