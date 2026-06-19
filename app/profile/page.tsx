"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/lib/auth-context";
import { userAPI } from "@/lib/api/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { UserData } from "@/lib/types/workspace";

function ProfileContent() {
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    language: "",
    role: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userAPI.getUser();
        if (res.data) {
          setProfile(res.data);
          setForm({
            name: res.data.name ?? "",
            username: res.data.username ?? "",
            language: res.data.language ?? "",
            role: "",
          });
        }
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await userAPI.updateProfile({
        user_id: profile.id,
        name: form.name,
        username: form.username,
        language: form.language,
        role: form.role,
      });
      setSuccess(true);
    } catch {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const initials =
    (form.name || user?.name || "U")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "U";

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-card/30">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="bg-card border border-border/50 rounded-xl p-8 space-y-8">
            <div className="flex items-center gap-5">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold text-foreground">{form.name || "—"}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">GitHub Username</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => setUsernameFocused(false)}
                />
                {usernameFocused && (
                  <p className="text-xs text-muted-foreground">
                    Make sure you use the same username as your GitHub username.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={form.language}
                  onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile?.email ?? ""} disabled />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-500">Profile updated successfully.</p>}

            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
