"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Shield, CheckCircle, Users, Zap, Wallet, Globe, CreditCard, AlertCircle, Loader2, ExternalLink, Smartphone, Banknote, Building, MapPin, Network } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAfricanProof } from "@/hooks/useAfricanProof";
import { SUPPORTED_COUNTRIES } from "@/lib/contracts";

// Dynamically import the African Network Animation
const AfricanNetworkAnimation = dynamic(
  () =>
    import("@/components/AfricanNetworkAnimation").then(
      (mod) => mod.AfricanNetworkAnimation
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 rounded-2xl animate-pulse flex items-center justify-center">
        <div className="text-6xl animate-pulse">🌍</div>
      </div>
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
            Empowering{" "}
            <span className="text-green-400">African</span>{" "}
            Communities with Trusted Identity
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">
            Revolutionizing financial inclusion, governance, and social impact across Africa through
            blockchain-verified, government-backed digital identities.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <a href="/africanproof">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                🌍 Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <a href="/africanproof">
              <Button
                size="lg"
                variant="outline"
                className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
              >
                Explore Platform
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>

          <div className="lg:hidden w-full h-80">
            <AfricanNetworkAnimation />
          </div>
        </div>

        {/* Right Side - African Network Animation (Desktop only, bigger size) */}
        <div className="hidden lg:flex items-center justify-end w-full max-w-3xl">
          <div className="w-full h-[600px] lg:h-[700px] flex justify-end">
            <AfricanNetworkAnimation />
          </div>
        </div>
      </div>

      {/* Problem Statement Section */}
      <section className="relative z-10 py-16 lg:py-24 px-6 lg:px-12 bg-card/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-8">
            The Reality Across Africa
          </h2>
          <p className="text-lg text-muted-foreground mb-6 text-pretty leading-relaxed">
            Over 400 million Africans lack formal identification, creating barriers to banking, healthcare, and education.
            Cross-border remittances cost families up to 20% in fees, while fraudulent aid distribution leaves
            vulnerable communities without essential resources.
          </p>
          <p className="text-lg text-foreground font-medium">
            AfricanProof creates blockchain-verified, government-backed identities using ENS domains—
            enabling secure financial services, transparent governance, and direct aid distribution
            across all 54 African nations.
          </p>
        </div>
      </section>

      {/* Why LATAM Needs This Section */}
      <section id="why" className="relative z-10 py-16 lg:py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-8 text-center">
            Transforming African Communities
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <Smartphone className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Mobile-first identity solutions for Africa's 1.4 billion people,
                  leveraging the continent's mobile penetration rate.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Banknote className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Reducing remittance costs from 20% to under 1% for the $100B
                  sent to Africa annually.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <Building className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Enabling transparent governance and fair resource distribution
                  across African institutions.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Connecting rural communities to global financial systems
                  and opportunities.
                </p>
              </div>
            </div>
          </div>
          <p className="text-center text-lg text-foreground mt-8 font-medium">
            AfricanProof bridges the digital divide with blockchain-verified identities
            that unlock financial freedom and social empowerment.
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
              <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-slate-900">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Government Verification
              </h3>
              <p className="text-muted-foreground">
                Citizens verify their identity through official government channels and biometric data.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-slate-900">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Blockchain Identity
              </h3>
              <p className="text-muted-foreground">
                Receive a country-linked ENS domain (e.g., kwame.gha.gwill.eth) with verified credentials.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-slate-900">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Universal Access
              </h3>
              <p className="text-muted-foreground">
                Access banking, healthcare, education, and governance systems across Africa
                with one trusted digital identity.
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
            Real-World Impact
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-lg p-6 border-l-4 border-green-400">
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                🏥 Healthcare Access
              </h3>
              <p className="text-muted-foreground">
                Secure medical records and insurance verification across African healthcare systems.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border-l-4 border-blue-400">
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                🌾 Agricultural Finance
              </h3>
              <p className="text-muted-foreground">
                Farmers access microloans and crop insurance with verified land ownership and identity.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border-l-4 border-purple-400">
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                💸 Diaspora Remittances
              </h3>
              <p className="text-muted-foreground">
                African diaspora sends $100B+ annually home with instant, low-cost transfers.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border-l-4 border-amber-400">
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                🗳️ Democratic Participation
              </h3>
              <p className="text-muted-foreground">
                Transparent elections and community governance with sybil-resistant voting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center justify-between p-6 lg:px-12">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2025 Afroproof. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <a
              href="#privacy"
              className="text-muted-foreground hover:text-cyan-400 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              className="text-muted-foreground hover:text-cyan-400 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#contact"
              className="text-muted-foreground hover:text-cyan-400 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
