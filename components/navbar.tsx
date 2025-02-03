"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wallet, LineChart, CreditCard, Library } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6" />
          <span className="font-bold">FinTracker</span>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Home
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/transactions" className="flex items-center gap-2">
              <Library className="w-4 h-4" /> Transactions
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/budget" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" /> Budget
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" /> Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
