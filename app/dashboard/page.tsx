"use client";

import React, { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code2, LogOut, User, Mail, Shield } from "lucide-react";
import Link from "next/link";
import { CreateWorkspaceForm } from "@/components/CreateWorkspaceForm";
import { WorkspacesList } from "@/components/WorkspacesList";
import { Navbar } from "@/components/navbar";
import api from "@/lib/axios";

interface Workspace {
  id: number
  name: string
  owner_id: number
  type: boolean
  created_at: string
  updated_at: string
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const fetchWorkspaces = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post('http://localhost:8000/v1/workspace/getall_workspace')

      if (response.data.message === 'Success') {
        setWorkspaces(Array.isArray(response.data.data) ? response.data.data : [response.data.data])
        console.log("workspaces", response.data.data)
      } else {
        setError(response.data.message || 'Failed to fetch workspaces')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchWorkspaces()
  }, [])

  const handleWorkspaceCreated = (newWorkspace: Workspace) => {
    setWorkspaces((prev) => {
      if (!prev) return [newWorkspace]
      return [newWorkspace, ...prev]
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-card/30">
      {/* Header */}
      <nav>
        <Navbar />
      </nav>
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Welcome back! Manage your workspaces and collaborate with your team.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Create Workspace Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CreateWorkspaceForm onWorkspaceCreated={handleWorkspaceCreated} />
            </div>
          </div>

          {/* Workspaces List */}
          <div className="lg:col-span-2">
            <WorkspacesList
              workspaces={workspaces}
              loading={loading}
              error={error}
              onRefresh={fetchWorkspaces}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
