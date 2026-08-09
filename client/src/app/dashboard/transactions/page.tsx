"use client";

import { ProtectedRoute } from "../../../components/ProtectedRoute";
import { DonationsTable } from "../../../components/DonationsTable";

export default function TransactionsPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN", "ADMIN"]}>
      <h1 className="mb-6 font-display text-2xl font-semibold tracking-tight">
        Transactions
      </h1>
      <DonationsTable />
    </ProtectedRoute>
  );
}
