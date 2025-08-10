"use client";
import Link from "next/link";
import {
  Home,
  Repeat2,
  Settings,
  LogOut,
  ChevronDown,
  User2,
  CreditCard,
  BarChart,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PayPalLogo } from "@/components/paypal-logo";

interface AppSidebarProps {
  userName: string;
  onLogout: () => void;
}

export function AppSidebar({ userName, onLogout }: AppSidebarProps) {
  return (
    <Sidebar
      className="bg-paypal-primary text-paypal-primary-foreground shadow-lg"
      collapsible="none" // Ensure sidebar is always expanded
    >
      <SidebarHeader className="p-4 border-b border-paypal-primary-foreground/20">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          prefetch={false}
        >
          <PayPalLogo className="h-8 w-8 text-paypal-accent" />
          <span className="text-2xl font-extrabold text-paypal-primary-foreground">
            PayClone
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase text-paypal-primary-foreground/70 mb-2">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard" isActive={true}>
                  <Link
                    href="/dashboard"
                    prefetch={false}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-paypal-accent/20"
                  >
                    <Home className="h-5 w-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Wallet">
                  <Link
                    href="/dashboard#wallet"
                    prefetch={false}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-paypal-accent/20"
                  >
                    <CreditCard className="h-5 w-5" />
                    <span className="font-medium">Wallet</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Transactions">
                  <Link
                    href="/dashboard#transactions"
                    prefetch={false}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-paypal-accent/20"
                  >
                    <Repeat2 className="h-5 w-5" />
                    <span className="font-medium">Transactions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Analytics">
                  <Link
                    href="#"
                    prefetch={false}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-paypal-accent/20"
                  >
                    <BarChart className="h-5 w-5" />
                    <span className="font-medium">Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="my-4 bg-paypal-primary-foreground/20" />
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase text-paypal-primary-foreground/70 mb-2">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <Link
                    href="#"
                    prefetch={false}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-paypal-accent/20"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-paypal-primary-foreground/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  tooltip="User Menu"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-paypal-accent/20"
                >
                  <User2 className="h-5 w-5" />
                  <span className="font-medium">{userName}</span>
                  <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-70" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-[var(--radix-popper-anchor-width)] bg-card text-foreground shadow-lg"
              >
                <DropdownMenuItem className="cursor-pointer hover:bg-muted">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-muted">
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onLogout}
                  className="cursor-pointer text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
