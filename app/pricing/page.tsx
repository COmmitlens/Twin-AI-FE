"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pricingAPI } from "@/lib/api/pricing";
import { CreditOption, Subscription } from "@/lib/types/workspace";
import { useAuth } from "@/lib/auth-context";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [plan, setPlan] = useState<CreditOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const creditRes = await pricingAPI.getCreditOptions();
        if (creditRes.data?.length) setPlan(creditRes.data[0]);
      } catch {
        setError("Failed to load plans");
      }

      if (isAuthenticated) {
        try {
          const statusRes = await pricingAPI.getSubscriptionStatus();
          const active = statusRes.data?.find((s) => s.status === "active");
          if (active) setSubscription(active);
        } catch {
          // not subscribed or not authenticated — ignore
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [isAuthenticated]);

  const handleSubscribe = async () => {
    if (!plan) return;

    if (!user?.email || !EMAIL_RE.test(user.email)) {
      setError(
        "Your account has no valid email. Please update your profile before subscribing."
      );
      return;
    }

    setError(null);
    setSubscribing(true);
    try {
      const res = await pricingAPI.subscribe(plan.id);
      if (res.data?.session_url) {
        window.location.href = res.data.session_url;
      }
    } catch {
      setError("Failed to start checkout. Please try again.");
      setSubscribing(false);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await pricingAPI.cancelSub(subscription.id);
      if (res.data) setSubscription(res.data);
    } catch {
      setCancelError("Failed to cancel. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const freeFeatures = [
    "5 credits per month",
    "Basic AI explanations",
    "1 workspace",
    "Community support",
  ];

  const isActive = subscription?.status === "active";
  const isCanceled = subscription?.status === "canceled";

  const periodEndLabel = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Simple Pricing
        </h1>
        <p className="text-muted-foreground text-lg">
          Start free. Upgrade when you need more.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        {/* Free Card */}
        <div className="rounded-2xl border border-border bg-card p-8 flex flex-col">
          <div className="mb-6">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Free
            </p>
            <div className="flex items-end gap-1">
              <span className="text-5xl font-bold">$0</span>
              <span className="text-muted-foreground mb-2">/mo</span>
            </div>
          </div>

          <ul className="space-y-3 flex-1 mb-8">
            {freeFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button variant="outline" className="w-full">
            Get Started
          </Button>
        </div>

        {/* Paid Card */}
        <div className="rounded-2xl border-2 border-primary bg-card p-8 flex flex-col relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              Most Popular
            </span>
            {subscription && (
              <span
                className={`text-white text-xs font-semibold px-3 py-1 rounded-full ${
                  isActive ? "bg-green-500" : "bg-orange-500"
                }`}
              >
                {isActive ? "Active" : "Canceled"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : error && !plan ? (
            <div className="flex-1 flex items-center justify-center text-sm text-destructive">
              {error}
            </div>
          ) : plan ? (
            <>
              <div className="mb-6">
                <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">
                  Pro
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold">
                    ${(plan.price.en / 100).toFixed(0)}
                  </span>
                  <span className="text-muted-foreground mb-2">/mo</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.value} credits included
                </p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.points.map((point, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{point.en}</span>
                  </li>
                ))}
                {plan.other.en && (
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{plan.other.en}</span>
                  </li>
                )}
              </ul>

              {error && (
                <p className="text-xs text-destructive mb-3 text-center">
                  {error}
                </p>
              )}

              {periodEndLabel && (
                <p className="text-xs text-muted-foreground mb-3 text-center">
                  {isCanceled
                    ? `Access until ${periodEndLabel}`
                    : `Renews on ${periodEndLabel}`}
                </p>
              )}

              {!isAuthenticated ? (
                <Button
                  className="w-full"
                  onClick={() => router.push("/login")}
                >
                  Sign up to Subscribe
                </Button>
              ) : isActive ? (
                <>
                  {cancelError && (
                    <p className="text-xs text-destructive mb-2 text-center">
                      {cancelError}
                    </p>
                  )}
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    {cancelling && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Cancel Subscription
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleSubscribe}
                  disabled={subscribing || isCanceled}
                >
                  {subscribing && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isCanceled ? "Subscription ending" : "Upgrade to Pro"}
                </Button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
