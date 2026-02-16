"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Code2, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { verifyOTP } = useAuth();
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;
  const email = decodeURIComponent(params.email as string);

  useEffect(() => {
    if (!id || !email) {
      router.push("/sign-up");
    }
  }, [id, email, router]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Next.js automatically decodes URL params, so email is already decoded
      const result = await verifyOTP(id, email, otp);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(result.message || "OTP verification failed");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    // Implement resend OTP logic here
    console.log("Resend OTP");
    alert("OTP resent! (Demo mode)");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">CommitLens</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-card border border-border rounded-lg shadow-lg p-8">
            {!success ? (
              <>
                {/* Title */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">Verify Your Email</h1>
                  <p className="text-muted-foreground">
                    We&apos;ve sent a verification code to
                  </p>
                  <p className="text-foreground font-medium mt-1">
                    {decodeURIComponent(email)}
                  </p>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <div className="ml-2">
                      <p className="font-medium">Error</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </Alert>
                )}

                {/* OTP Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Enter verification code
                  </label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => {
                        setOtp(value);
                        setError("");
                      }}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                {/* Verify Button */}
                <Button
                  onClick={handleVerify}
                  className="w-full mb-4"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>

                {/* Resend OTP */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Didn&apos;t receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-primary hover:underline font-medium"
                      disabled={isLoading}
                    >
                      Resend
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">Email Verified!</h1>
                  <p className="text-muted-foreground mb-6">
                    Your email has been successfully verified. Redirecting to
                    login...
                  </p>
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              </>
            )}
          </div>

          {/* Back to Sign Up */}
          {!success && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              Wrong email?{" "}
              <Link href="/sign-up" className="text-primary hover:underline">
                Go back to sign up
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
