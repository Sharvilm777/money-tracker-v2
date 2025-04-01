"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { useFinanceStore } from "@/lib/store";
import api from "@/lib/api";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const initialize = useFinanceStore((state) => state.initialize);

  useEffect(() => {
    async function checkAuth() {
      console.log("Checking authentication...");
      const isAuth = api.auth.isAuthenticated();
      console.log("Is authenticated:", isAuth);
      
      if (!isAuth) {
        console.log("Not authenticated, redirecting to login");
        router.push("/login");
        return;
      }

      try {
        // Initialize the store with data from API
        console.log("Initializing store data...");
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
    <div className="flex min-h-screen flex-col">
      {/* Navbar visible on all pages */}
      <Navbar />
      
      {/* Main content area with mobile spacing */}
      <div className="flex-1 md:ml-64 pt-2 md:pt-4">
        <main className="pb-16 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}