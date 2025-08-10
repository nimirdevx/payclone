"use client";

import type React from "react";

interface AuthCardProps {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export function AuthCard({
  title,
  description,
  footer,
  children,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-8 shadow-lg">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children}
      <div className="text-center text-sm text-muted-foreground">{footer}</div>
    </div>
  );
}
