"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24 md:py-32">
      <div className="text-center space-y-8 max-w-3xl mx-auto">
        <div className="inline-block px-3 py-1 bg-secondary rounded-full text-sm text-muted-foreground border border-border">
          🚀 Instant Code Understanding
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
          Instantly understand why a code change was made — not just what
          changed.
        </h1>

        <p className="text-xl text-muted-foreground text-balance">
          We automatically analyze GitHub commits and explain the purpose,
          reasoning, and potential impact of each change — so engineers don't
          have to dig through diffs.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8"
            onClick={() => {
              window.location.href = "/sign-up";
            }}
          >
            Start Free <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-border text-foreground hover:bg-secondary h-12 px-8 bg-transparent"
          >
            Watch Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
