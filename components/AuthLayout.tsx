"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFinanceStore } from "@/lib/store";
import api from "@/lib/api";
import Navbar from "./navbar";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const initialize = useFinanceStore((state) => state.initialize);

  useEffect(() => {
    async function checkAuth() {
      if (!api.auth.isAuthenticated()) {
        router.push("/login");
        return;
      }

      try {
        // Initialize the store with data from API
        await initialize();
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing app:", error);
        // If there's an initialization error, redirect to login
        router.push("/login");
      }
    }

    checkAuth();
  }, [router, initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}