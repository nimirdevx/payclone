import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingHeader } from "@/components/landing-header";
import {
  DollarSign,
  ShieldCheck,
  Repeat2,
  Headphones,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground">
      {/* Fixed Header */}
      <LandingHeader fixed={true} />
      
      {/* Main content with top padding to account for fixed header */}
      <main className="flex-1 w-full pt-14">
        {" "}
        {/* Added w-full */}
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-paypal-primary to-paypal-primary/80 text-paypal-primary-foreground">
          <div className="container px-4 md:px-6 text-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                Your Money, Simplified.
              </h1>
              <p className="mx-auto max-w-[700px] text-lg md:text-xl">
                Send, receive, and manage your money with ease. Secure, fast,
                and reliable payments for everyone.
              </p>
              <div className="space-x-4">
                <Button
                  asChild
                  className="bg-paypal-accent hover:bg-paypal-accent/90 text-paypal-accent-foreground px-8 py-3 text-lg"
                >
                  <Link href="/login">Get Started</Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-paypal-primary-foreground text-paypal-primary-foreground hover:bg-paypal-primary-foreground/10 px-8 py-3 text-lg bg-transparent"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
        {/* Features Section */}
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-background"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-paypal-primary">
                  Key Features
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Experience seamless financial transactions with our powerful
                  features.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-2 text-center p-4 rounded-lg shadow-sm bg-card">
                <DollarSign className="h-10 w-10 text-paypal-accent" />
                <h3 className="text-xl font-bold text-paypal-primary">
                  Instant Payments
                </h3>
                <p className="text-muted-foreground">
                  Send and receive money instantly, anywhere in the world.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center p-4 rounded-lg shadow-sm bg-card">
                <ShieldCheck className="h-10 w-10 text-paypal-accent" />
                <h3 className="text-xl font-bold text-paypal-primary">
                  Secure Transactions
                </h3>
                <p className="text-muted-foreground">
                  Your financial data is protected with industry-leading
                  encryption.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center p-4 rounded-lg shadow-sm bg-card">
                <Repeat2 className="h-10 w-10 text-paypal-accent" />
                <h3 className="text-xl font-bold text-paypal-primary">
                  Easy Transfers
                </h3>
                <p className="text-muted-foreground">
                  Link your bank accounts and transfer funds effortlessly.
                </p>
              </div>
              {/* <div className="flex flex-col items-center space-y-2 text-center p-4 rounded-lg shadow-sm bg-card">
                <Headphones className="h-10 w-10 text-paypal-accent" />
                <h3 className="text-xl font-bold text-paypal-primary">
                  24/7 Support
                </h3>
                <p className="text-muted-foreground">
                  Our dedicated support team is always here to help you.
                </p>
              </div> */}
            </div>
          </div>
        </section>
        {/* Final Call-to-Action Section */}
        <section
          id="cta"
          className="w-full py-12 md:py-24 lg:py-32 bg-paypal-secondary text-paypal-secondary-foreground"
        >
          <div className="container px-4 md:px-6 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-paypal-primary">
                Ready to simplify your finances?
              </h2>
              <p className="mx-auto max-w-[700px] text-lg md:text-xl">
                Join PayClone today and experience a new way to manage your
                money.
              </p>
              <Button
                asChild
                className="bg-paypal-primary hover:bg-paypal-primary/90 text-paypal-primary-foreground px-8 py-3 text-lg"
              >
                <Link href="/login">Sign Up Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-card text-muted-foreground">
        <p className="text-xs">&copy; 2025 PayClone. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            Privacy
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            Contact
          </Link>
        </nav>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <Link
            href="#"
            className="text-muted-foreground hover:text-paypal-primary"
            prefetch={false}
          >
            <Facebook className="h-5 w-5" />
            <span className="sr-only">Facebook</span>
          </Link>
          <Link
            href="#"
            className="text-muted-foreground hover:text-paypal-primary"
            prefetch={false}
          >
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link
            href="#"
            className="text-muted-foreground hover:text-paypal-primary"
            prefetch={false}
          >
            <Linkedin className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
