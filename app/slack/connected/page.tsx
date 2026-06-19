"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SlackConnectedPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          router.push("/dashboard")
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Connected to Slack</h1>
          <p className="text-muted-foreground text-sm">
            Your workspace has been successfully connected to Slack.
          </p>
          <p className="text-muted-foreground text-sm">
            Redirecting to dashboard in{" "}
            <span className="font-semibold text-foreground">{countdown}</span>s…
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard")} className="w-full">
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
