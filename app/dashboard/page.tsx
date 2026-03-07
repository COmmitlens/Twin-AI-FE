"use client";

import  { useEffect,useState } from "react";
import ProtectedRoute from "@/components/protected-route";
import { CreateWorkspaceForm } from "@/components/CreateWorkspaceForm";
import { WorkspacesList } from "@/components/WorkspacesList";
import { Header } from "@/components/header";
import api from "@/lib/axios";
import type { Workspace } from "@/lib/types/workspace";

function DashboardContent() {
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkspaces = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post('/workspace/getall_workspace')

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
      <Header />

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
