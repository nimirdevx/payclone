import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PayPalLogo } from "@/components/paypal-logo";

interface LandingHeaderProps {
  fixed?: boolean;
  className?: string;
}

export function LandingHeader({ fixed = true, className = "" }: LandingHeaderProps) {
  const baseClasses = "px-4 lg:px-6 h-14 flex items-center justify-between border-b bg-card w-full z-50";
  const fixedClasses = fixed ? "fixed top-0 left-0 right-0" : "";
  const headerClasses = `${baseClasses} ${fixedClasses} ${className}`.trim();

  return (
    <header className={headerClasses}>
      <Link
        href="#"
        className="flex items-center justify-center gap-2"
        prefetch={false}
      >
        <PayPalLogo />
        <span className="text-xl font-bold text-paypal-primary">
          PayClone
        </span>
      </Link>
      <nav className="hidden md:flex gap-4 sm:gap-6">
        <Link
          href="#features"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          Features
        </Link>
        <Link
          href="#cta"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          Sign Up
        </Link>
      </nav>
      <Button
        asChild
        className="bg-paypal-primary hover:bg-paypal-primary/90 text-paypal-primary-foreground"
      >
        <Link href="/login">Sign In</Link>
      </Button>
    </header>
  );
}
