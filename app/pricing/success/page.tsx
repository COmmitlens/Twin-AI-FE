"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pricingAPI } from "@/lib/api/pricing";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    pricingAPI
      .verifySub(sessionId)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {status === "loading" && (
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verifying your subscription…</p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center space-y-4 max-w-sm">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">You&apos;re all set!</h1>
          <p className="text-muted-foreground">
            Your Pro subscription is now active. Enjoy unlimited credits.
          </p>
          <Button className="w-full" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="text-center space-y-4 max-w-sm">
          <XCircle className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Verification failed</h1>
          <p className="text-muted-foreground">
            We couldn&apos;t verify your subscription. If you were charged,
            please contact support.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/pricing")}
            >
              Back to Pricing
            </Button>
            <Button
              className="flex-1"
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PricingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
