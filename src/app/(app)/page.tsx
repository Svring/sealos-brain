"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the graph page
    router.replace("/home");
  }, [router]);

  // Show a loading state while redirecting
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Home...</p>
      </div>
    </div>
  );
}
