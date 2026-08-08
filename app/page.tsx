"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Code2, Zap } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";

export default function Home() {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT;
  console.log("Environment:", env);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />

      {/* Purpose Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-4xl font-bold mb-6">What is this?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              This project helps engineering teams quickly understand code
              changes without reading large diffs or tracing commit history
              manually.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              For every commit, we generate a clear, human-readable explanation
              that summarizes what changed, why it was done, and what impact it
              may have.
            </p>
          </div>
          <div className="bg-secondary rounded-lg p-8 border border-border">
            <div className="space-y-4">
              <div className="flex gap-4">
                <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Instant Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatic processing of every commit you push
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">No Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    One-click GitHub integration, zero setup needed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
        <div className="space-y-8">
          <h2 className="text-4xl font-bold">The problem</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Moving Fast</h3>
              <p className="text-muted-foreground">
                Modern codebases move fast. Engineers often spend significant
                time trying to understand why a change was introduced.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Lost Context</h3>
              <p className="text-muted-foreground">
                Determining whether it affects critical logic is difficult when
                reading raw diffs without proper context or contributor
                knowledge.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Hidden Risk</h3>
              <p className="text-muted-foreground">
                Identifying if code introduces risk or technical debt requires
                deep analysis that&apos;s often overlooked in code reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
        <div className="space-y-12">
          <h2 className="text-4xl font-bold">Our solution</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground">
                We analyze commits using structured context, historical changes,
                and code understanding to generate concise explanations for
                every change.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Clear Summary</h4>
                    <p className="text-muted-foreground">
                      A short summary of what changed and why
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Key Reasoning</h4>
                    <p className="text-muted-foreground">
                      Points behind the change for better understanding
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Impact Clarity</h4>
                    <p className="text-muted-foreground">
                      Determine if change is trivial or impactful
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-secondary rounded-lg p-8 border border-border h-96 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Code2 className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  Example explanation preview
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="max-w-6xl mx-auto px-6 py-16 border-t border-border"
      >
        <div className="space-y-12">
          <h2 className="text-4xl font-bold">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Install Integration</h3>
              <p className="text-muted-foreground">
                Connect your GitHub repository with one click. No complex setup
                required.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Push Code</h3>
              <p className="text-muted-foreground">
                Push code as usual. Our system monitors your commits
                automatically.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Get Explanations</h3>
              <p className="text-muted-foreground">
                Instantly receive clear explanations for each commit. No models.
                No complexity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Built For */}
      <section
        id="pricing"
        className="max-w-6xl mx-auto px-6 py-16 border-t border-border"
      >
        <div className="space-y-12">
          <h2 className="text-4xl font-bold">Built for</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-secondary rounded-lg p-8 border border-border space-y-4">
              <h3 className="text-xl font-semibold">Engineering Teams</h3>
              <p className="text-muted-foreground">
                Reviewing pull requests becomes faster and more thorough with
                instant context on why changes were made.
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-8 border border-border space-y-4">
              <h3 className="text-xl font-semibold">Startup Teams</h3>
              <p className="text-muted-foreground">
                Moving fast without full documentation? Get clarity on code
                changes instantly as your team scales.
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-8 border border-border space-y-4">
              <h3 className="text-xl font-semibold">Maintainers</h3>
              <p className="text-muted-foreground">
                Onboarding new contributors is easier when they can instantly
                understand the &quot;why&quot; behind code decisions.
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-8 border border-border space-y-4">
              <h3 className="text-xl font-semibold">Anyone</h3>
              <p className="text-muted-foreground">
                If you want clarity instead of guesswork about code changes,
                this is built for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why It's Different */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
        <div className="space-y-8">
          <h2 className="text-4xl font-bold">Why it&apos;s different</h2>
          <div className="space-y-6">
            <div className="bg-secondary rounded-lg p-8 border border-border">
              <h3 className="text-xl font-semibold mb-3">
                Not a Generic AI Tool
              </h3>
              <p className="text-muted-foreground mb-4">
                Unlike generic AI tools, this system is built specifically for
                understanding code changes.
              </p>
              <ul className="space-y-2">
                <li className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Commit-level intent, not just code syntax
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Deterministic and structured output
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Clear, actionable explanations — not long essays
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-border text-center">
        <div className="space-y-6">
          <h2 className="text-5xl font-bold text-balance">
            Code moves fast. Understanding it shouldn&apos;t be slow.
          </h2>
          <p className="text-xl text-muted-foreground">
            Less time reading diffs. More time building.
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
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8 text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">CommitLens</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-foreground transition">
              Docs
            </a>
            <a href="#" className="hover:text-foreground transition">
              Twitter
            </a>
            <a href="#" className="hover:text-foreground transition">
              GitHub
            </a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-8 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CommitLens. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
