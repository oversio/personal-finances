"use client";

import { Card, CardBody } from "@heroui/react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: "primary" | "success" | "warning" | "danger" | "default";
}

export function StatCard({ title, value, icon, trend, color = "default" }: StatCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
    default: "bg-default/10 text-default-500",
  };

  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-default-500">{title}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={`text-sm font-medium ${trend.isPositive ? "text-success" : "text-danger"}`}
                >
                  {trend.isPositive ? "↑" : "↓"} {trend.value}
                </span>
                <span className="text-sm text-default-400">vs last month</span>
              </div>
            )}
          </div>
          <div className={`rounded-lg p-3 ${colorClasses[color]}`}>{icon}</div>
        </div>
      </CardBody>
    </Card>
  );
}
