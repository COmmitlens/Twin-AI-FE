"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";

export function Header() {
	const { user, logout } = useAuth();
	const router = useRouter();

	const handleLogout = async () => {
		await logout();
		router.push("/login");
	};

	const displayName = user?.name || "User";
	const displayEmail = user?.email || "";
	const initials = displayName
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("") || "U";

	return (
		<header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
					<p className="text-muted-foreground text-sm">
						Welcome back! Manage your workspaces and collaborate with your team.
					</p>
				</div>

				<div className="flex items-center gap-3">
					<button
						onClick={() => router.push("/profile")}
						className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-accent transition-colors"
					>
						<Avatar className="h-9 w-9">
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>

						<div className="hidden sm:block text-right">
							<p className="text-sm font-medium text-foreground leading-none">{displayName}</p>
							{displayEmail && <p className="text-xs text-muted-foreground mt-1">{displayEmail}</p>}
						</div>
					</button>

					<Button variant="outline" size="sm" onClick={handleLogout}>
						<LogOut className="h-4 w-4" />
						Logout
					</Button>
				</div>
			</div>
		</header>
	);

}