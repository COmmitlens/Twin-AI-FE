"use client";

import React from "react";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Code2, Mail, Lock, User, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export default function SignUpPage() {
  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  const { register, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    // Clear API error when user starts typing
    if (apiError) {
      setApiError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const result = await register(formData);

      if (result.success) {
        // Registration successful, redirect to OTP verification
        const { user_id, email } = result.data;
        console.log("res", result.data);
        // Don't encode email - use formData.email which is the original input
        router.push(
          `/verify-otp/${user_id}/${encodeURIComponent(formData.email)}`,
        );
      } else {
        setApiError(result.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Sign-up error:", error);
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      const response = await api.get<{ message: string; data: { url: string } }>("/auth/google");
      window.location.href = response.data.data.url;
    } catch (error) {
      console.error("Google sign-up error:", error);
      setApiError("Failed to sign up with Google");
      setIsGoogleLoading(false);
    }
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
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              Already have an account?
            </span>
            <Link href="/login">
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-secondary bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Title */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Create your account</h1>
            <p className="text-muted-foreground">
              Join CommitLens and start understanding code changes instantly
            </p>
          </div>

          {/* API Error Alert */}
          {apiError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <div className="ml-2">
                <p className="font-medium">Error</p>
                <p className="text-sm">{apiError}</p>
              </div>
            </Alert>
          )}

          {/* Google Sign-up Button */}
          <Button
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
            variant="outline"
            className="w-full border-border text-foreground hover:bg-secondary h-11 gap-2 bg-transparent"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isGoogleLoading ? "Connecting..." : "Continue with Google"}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Sign-up Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Full Name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              icon={<User className="w-4 h-4" />}
              disabled={isLoading}
            />

            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
              disabled={isLoading}
            />

            <Field
              label="Password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={<Lock className="w-4 h-4" />}
              helperText="Must be at least 8 characters"
              disabled={isLoading}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          {/* Terms */}
          <p className="text-xs text-center text-muted-foreground">
            By signing up, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>

          {/* Login Link */}
          <p className="text-center text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-muted-foreground text-sm">
          <p>&copy; 2024 CommitLens. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
