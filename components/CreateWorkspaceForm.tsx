'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import api from '@/lib/axios'

interface CreateWorkspaceFormProps {
  onWorkspaceCreated?: (workspace: any) => void
}

const WORKSPACE_TYPES = [
  { value: 'true', label: 'Public', description: 'Visible to everyone' },
  { value: 'false', label: 'Private', description: 'Only visible to you and invited members' },
]

export function CreateWorkspaceForm({ onWorkspaceCreated }: CreateWorkspaceFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!name.trim()) {
      setError('Workspace name is required')
      return
    }

    if (!type) {
      setError('Please select a workspace type')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('http://localhost:8000/v1/workspace/create', {
        name: name.trim(),
        type: type === 'true',
      })

      if (response.data.message === 'Success') {
        setSuccess(true)
        setName('')
        setType('')

        onWorkspaceCreated?.(response.data.data)

        setTimeout(() => {
          setSuccess(false)
        }, 3000)
      } else {
        setError(response.data.message || 'Failed to create workspace')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const selectedTypeObj = WORKSPACE_TYPES.find((t) => t.value === type)

  return (
    <Card className="border-border/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Workspace</CardTitle>
        <CardDescription>Set up a new workspace to organize your work and collaborate with others</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="border-destructive/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500/50 bg-green-950/50">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">Workspace created successfully!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="workspace-name" className="text-foreground">
              Workspace Name
            </Label>
            <Input
              id="workspace-name"
              placeholder="e.g., Engineering Team, Marketing Projects"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="border-border/50 bg-card/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspace-type" className="text-foreground">
              Workspace Type
            </Label>
            <Select value={type} onValueChange={setType} disabled={loading}>
              <SelectTrigger className="border-border/50 bg-card/50 text-foreground">
                <SelectValue placeholder="Choose a workspace type" />
              </SelectTrigger>
              <SelectContent className="border-border/50 bg-card">
                {WORKSPACE_TYPES.map((typeOption) => (
                  <SelectItem key={typeOption.value} value={typeOption.value}>
                    <div className="flex flex-col">
                      <span>{typeOption.label}</span>
                      <span className="text-xs text-muted-foreground">{typeOption.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTypeObj && (
              <p className="text-sm text-muted-foreground">{selectedTypeObj.description}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium h-11"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Workspace'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
