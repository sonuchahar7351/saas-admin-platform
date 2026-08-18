"use client";

import { ProtectedRoute } from "../../../components/ProtectedRoute";
import { DonationsTable } from "../../../components/DonationsTable";

export default function TransactionsPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN", "ADMIN"]}>
      <DonationsTable />
    </ProtectedRoute>
  );
}
