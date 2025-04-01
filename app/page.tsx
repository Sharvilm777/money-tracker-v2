"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated
    const isAuthenticated = api.auth.isAuthenticated();
    console.log("Root page - Auth check:", isAuthenticated);

    if (isAuthenticated) {
      // If authenticated, redirect to home dashboard
      router.push("/home");
    } else {
      // If not authenticated, redirect to login
      router.push("/login");
    }
  }, [router]);

  // Show loading indicator while checking auth and redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}