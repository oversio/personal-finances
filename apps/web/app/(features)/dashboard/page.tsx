"use client";

import { Card, CardBody } from "@heroui/react";
import { useAuthStore, selectUser } from "@/_commons/stores/auth.store";

export default function DashboardPage() {
  const user = useAuthStore(selectUser);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-default-500">Welcome{user?.name ? `, ${user.name}` : ""}!</p>
      </div>

      <Card>
        <CardBody>
          <p className="text-default-400">
            This is a placeholder page. The full dashboard will be built later.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
