"use client";

import { Card, CardBody, Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useAuthStore, selectUser } from "@/_commons/stores/auth.store";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore(selectUser);
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-4">
        <CardBody className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-default-500">
            Welcome{user?.name ? `, ${user.name}` : ""}!
          </p>
          <p className="text-small text-default-400">
            This is a placeholder page. The full dashboard will be built later.
          </p>
          <Button color="danger" variant="flat" onPress={handleLogout}>
            Logout
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
