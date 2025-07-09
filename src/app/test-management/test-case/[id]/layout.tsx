"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useParams } from "next/navigation";

export default function TestCaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  return (
    <DashboardLayout>
      <div className="container mx-auto">
        {children}
      </div>
    </DashboardLayout>
  );
}