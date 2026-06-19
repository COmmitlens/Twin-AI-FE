"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <Image src="/rect87.png" alt="CommitLens Logo" width={32} height={32} className="rounded-lg" />
          </div>
          <span className="font-bold text-lg">CommitLens</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground transition"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-muted-foreground hover:text-foreground transition"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            className="text-muted-foreground hover:text-foreground transition"
          >
            For Teams
          </a>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => router.push("/login")}>
          Get Started
        </Button>
      </div>
    </nav>
  );
}
