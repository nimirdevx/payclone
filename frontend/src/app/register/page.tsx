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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      console.log("Attempting registration for:", email);
      const response = await api.post("/users/register", {
        name,
        email,
        password,
      });
      console.log("Registration API response:", response.data);
      const userId = response.data.id;
      await api.post("/wallets", { userId: userId });
      console.log("Wallet created for user:", userId);
      router.push("/login");
      console.log("Navigating to /login");
    } catch (err: any) {
      console.error(
        "Registration failed",
        err.response ? err.response.data : err.message
      );
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
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
        title="Create Your Account"
        description="Join PayClone and start managing your money today."
        footer={
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-paypal-primary hover:underline"
              prefetch={false}
            >
              Login
            </Link>
          </>
        }
      >
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="focus-visible:ring-paypal-primary"
              disabled={loading}
            />
          </div>
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
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </AuthCard>
    </div>
  );
}
