"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-sm">
        <XCircle className="w-16 h-16 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold">Payment cancelled</h1>
        <p className="text-muted-foreground">
          You cancelled the checkout. No charge was made. You can upgrade
          whenever you&apos;re ready.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </Button>
          <Button className="flex-1" onClick={() => router.push("/pricing")}>
            Back to Pricing
          </Button>
        </div>
      </div>
    </div>
  );
}
