"use client";

import type React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth-card";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      console.log("Attempting login for:", email);
      const response = await api.post("/users/login", { email, password });
      console.log("Login API response:", response.data);
      localStorage.setItem("token", response.data.token);
      console.log("Token set in localStorage:", response.data.token);
      router.push("/dashboard");
      console.log("Navigating to /dashboard");
    } catch (err: any) {
      console.error(
        "Login failed",
        err.response ? err.response.data : err.message
      );
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-paypal-secondary p-4">
      {" "}
      {/* Ensure full width */}
      <AuthCard
        title="Welcome Back!"
        description="Sign in to your PayClone account."
        footer={
          <>
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-paypal-primary hover:underline"
              prefetch={false}
            >
              Register
            </Link>
          </>
        }
      >
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-visible:ring-paypal-primary"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-visible:ring-paypal-primary"
              disabled={loading}
            />
          </div>
          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}
          <Button
            type="submit"
            className="w-full bg-paypal-primary hover:bg-paypal-primary/90 text-paypal-primary-foreground"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </AuthCard>
    </div>
  );
}
