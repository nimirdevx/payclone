"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

export function MobileSidebarToggle() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={toggleSidebar}
      aria-label="Toggle mobile sidebar"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
