"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedIndexPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the home page within the protected group
    router.replace("/home");
  }, [router]);
  
  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}