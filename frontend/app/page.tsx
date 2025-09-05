"use client";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, CheckCircle, Users, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";

// Dynamically import the ThreeGlobeComponent to avoid SSR issues
const ThreeGlobeComponent = dynamic(
  () =>
    import("@/components/three-globe-component").then(
      (mod) => mod.ThreeGlobeComponent
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-sky-900/20 to-blue-900/20 rounded-lg animate-pulse" />
    ),
  }
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background dark relative overflow-hidden">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row lg:justify-between lg:items-center min-h-[calc(100vh-88px)] gap-12 p-6 lg:p-12">
        {/* Left Side - Hero Content */}
        <div className="flex flex-col justify-center max-w-xl lg:max-w-2xl">
          {/* Main Title */}
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            Verified Digital Identity for{" "}
            <span className="text-teal-400">Africa</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">
            Bringing trust, fairness, and financial access to Africa through
            ENS-powered, government-verified identities.
          </p>

          {/* CTA Button */}
          <a href="/verify">
            <div className="mb-8">
              <Button
                size="lg"
                className="bg-white hover:bg-gray-100 text-black"
              >
                Mint Your ENS ID
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </a>

          <div className="lg:hidden w-full h-80">
            <ThreeGlobeComponent />
          </div>
        </div>

        {/* Right Side - Globe (Desktop only, bigger size) */}
        <div className="hidden lg:flex items-center justify-end w-full max-w-3xl">
          <div className="w-full h-[600px] lg:h-[700px] flex justify-end">
            <ThreeGlobeComponent />
          </div>
        </div>
      </div>

      {/* Problem Statement Section */}
      <section className="relative z-10 py-16 lg:py-24 px-6 lg:px-12 bg-card/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-8">
            The Challenge
          </h2>
          <p className="text-lg text-muted-foreground mb-6 text-pretty leading-relaxed">
            Millions in Africa face challenges with fraud, duplicate
            identities, and financial exclusion. Aid funds often don't reach
            those who need them, remittances are costly and insecure, and
            communities struggle with fair governance.
          </p>
          <p className="text-lg text-foreground font-medium">
            Our solution combines Self-Sovereign Identity with ENS domains to
            create country-linked, sybil-resistant identities— open, reusable,
            and trusted across financial, governance, and disaster relief
            systems.
          </p>
        </div>
      </section>

      {/* Why LATAM Needs This Section */}
      <section id="why" className="relative z-10 py-16 lg:py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-8 text-center">
            Why LATAM Needs This
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-teal-400 mt-1 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Latin America struggles with fraud, duplicate identities, and
                  financial exclusion.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="h-6 w-6 text-teal-400 mt-1 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Aid and disaster relief often fail to reach the right people.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-teal-400 mt-1 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Communities face sybil attacks in governance and funding.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Zap className="h-6 w-6 text-teal-400 mt-1 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Millions remain unbanked, lacking formal credit histories.
                </p>
              </div>
            </div>
          </div>
          <p className="text-center text-lg text-foreground mt-8 font-medium">
            We're fixing this with a verified, reusable identity layer powered
            by ENS.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how"
        className="relative z-10 py-16 lg:py-24 px-6 lg:px-12 bg-card/50"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-12 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-black">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Verify ID
              </h3>
              <p className="text-muted-foreground">
                A citizen proves their identity via Self.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-black">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Mint ENS Domain
              </h3>
              <p className="text-muted-foreground">
                They receive a country-linked ENS name (e.g., ana.mexico.eth).
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-black">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Use Anywhere
              </h3>
              <p className="text-muted-foreground">
                Smart contracts recognize this verified identity with our
                sybil-resistant modifier.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section
        id="use-cases"
        className="relative z-10 py-16 lg:py-24 px-6 lg:px-12"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-12 text-center">
            Use Cases
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                Disaster Relief Funds
              </h3>
              <p className="text-muted-foreground">
                Aid reaches only verified citizens.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                Fair Governance
              </h3>
              <p className="text-muted-foreground">
                One person, one vote in DAOs and communities.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                Cross-Border Remittances
              </h3>
              <p className="text-muted-foreground">
                Migrants send money home safely and directly.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                Credit Access
              </h3>
              <p className="text-muted-foreground">
                Verified ENS activity helps build financial reputation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center justify-between p-6 lg:px-12">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2025 LatAm Proof. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <a
              href="#privacy"
              className="text-muted-foreground hover:text-sky-400 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              className="text-muted-foreground hover:text-sky-400 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#contact"
              className="text-muted-foreground hover:text-sky-400 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
