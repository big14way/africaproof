"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Globe,
  Wallet,
  CheckCircle,
  User,
  MapPin,
  ExternalLink,
  ArrowLeft,
  X,
  AlertCircle,
} from "lucide-react";
import Self from "@/components/Self";
import { client } from "@/lib/client";
import { available, SelfRegistrar, registry } from "@/lib/const";
import { Navbar } from "@/components/Navbar";
import { useAccount } from "wagmi";

export default function VerifyPage() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [name, setName] = useState("");
  const [showVerificationCard, setShowVerificationCard] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isDomainAvailable, setIsDomainAvailable] = useState<boolean | null>(
    null
  );
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = searchParams.get("page");
  const id = searchParams.get("id");
  const { address } = useAccount();

  const handleVerify = () => {
    if (selectedCountry && name && isDomainAvailable === true) {
      setShowVerificationCard(true);
    }
  };

  const countryCodeMap: { [key: string]: string } = {
    GHA: "ghana",
    NGA: "nigeria",
    KEN: "kenya",
    ZAF: "southafrica",
  };

  const handleSuccess = () => {
    setTimeout(() => {
      // Country code mapping
      const countryCodeMap: { [key: string]: string } = {
        GHA: "ghana",
        NGA: "nigeria",
        KEN: "kenya",
        ZAF: "southafrica",
      };

      const countryCode =
        countryCodeMap[selectedCountry] || selectedCountry.toLowerCase();
      router.push(
        `/verify?page=success&id=${name
          .toLowerCase()
          .replace(" ", "")}.${countryCode}.eth`
      );
    }, 3000);
  };

  const handleError = () => {
    setTimeout(() => {
      router.push("/verify?error");
    }, 3000);
  };

  const checkAvailability = useCallback(async () => {
    try {
      if (!selectedCountry || !name) return false;

      const bool = await client.readContract({
        address: SelfRegistrar,
        abi: available as any,
        functionName: "available",
        args: [name, registry[selectedCountry as keyof typeof registry]],
      });
      console.log("Domain availability:", bool);
      return bool;
    } catch (error) {
      console.error("Error checking domain availability:", error);
      return false;
    }
  }, [selectedCountry, name]);

  // Debounced availability checker
  useEffect(() => {
    if (!selectedCountry || !name) {
      setIsDomainAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingAvailability(true);
      try {
        const isAvailable: any = await checkAvailability();
        setIsDomainAvailable(isAvailable);
      } catch (error) {
        console.error("Error checking availability:", error);
        setIsDomainAvailable(false);
      } finally {
        setIsCheckingAvailability(false);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [name, selectedCountry, checkAvailability]);

  const SuccessPage = () => (
    <div className="min-h-screen bg-background dark relative overflow-hidden">
      <Navbar />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] p-6">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Success Animation */}
          <div className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
            <CheckCircle className="h-12 w-12 text-white animate-bounce" />
          </div>

          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Verification Successful!
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Your ENS domain has been successfully created and verified
            </p>
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                Your ENS Domain:
              </p>
              <p className="text-lg font-bold text-sky-400">{id}</p>
            </div>
          </div>

          <Button
            onClick={() =>
              window.open(`https://sepolia.app.ens.domains/${id}`, "_blank")
            }
            className="w-full bg-white hover:bg-gray-100 text-black"
            size="lg"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on ENS
          </Button>
        </div>
      </div>
    </div>
  );

  const ErrorPage = () => (
    <div className="min-h-screen bg-background dark relative overflow-hidden">
      <Navbar />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] p-6">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Error Animation */}
          <div className="mx-auto w-24 h-24 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <AlertCircle className="h-12 w-12 text-white animate-bounce" />
          </div>

          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Verification Failed
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              We couldn't verify your identity at this time. Please try again or
              contact support.
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-600 dark:text-red-400">
                Verification failed due to insufficient documentation or invalid
                information.
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push("/verify")}
            className="w-full bg-white hover:bg-gray-100 text-black"
            size="lg"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Verify
          </Button>
        </div>
      </div>
    </div>
  );

  if (page === "success") {
    return <SuccessPage />;
  }

  if (page === "error") {
    return <ErrorPage />;
  }

  return (
    <div className="min-h-screen bg-background dark relative overflow-hidden">
      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] p-6">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Verify Your Nationality
            </h1>
            <p className="text-muted-foreground text-lg">
              Choose your country and enter your name to begin the verification
              process
            </p>
          </div>

          {/* Verification Form */}
          <div className="space-y-6">
            {/* Country Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-sky-400" />
                Select Your Country
              </label>
              <Select
                value={selectedCountry}
                onValueChange={setSelectedCountry}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose your country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GHA">🇬🇭 Ghana</SelectItem>
                  <SelectItem value="NGA">🇳🇬 Nigeria</SelectItem>
                  <SelectItem value="KEN">🇰🇪 Kenya</SelectItem>
                  <SelectItem value="ZAF">🇿🇦 South Africa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center">
                <User className="mr-2 h-4 w-4 text-sky-400" />
                Ens Domain
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full ${selectedCountry ? "pr-20" : "pr-10"}`}
                />
                {/* Country Code Suffix */}
                {selectedCountry && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500 font-mono text-sm">
                    .{countryCodeMap[selectedCountry].toLowerCase()}.eth
                  </div>
                )}
                {/* Availability Indicator */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isCheckingAvailability ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-sky-400 rounded-full animate-spin" />
                  ) : isDomainAvailable === true ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : isDomainAvailable === false ? (
                    <X className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
              </div>
              {/* Availability Status Text */}
              {isDomainAvailable === true && (
                <p className="text-sm text-green-600">✓ Domain is available</p>
              )}
              {isDomainAvailable === false && (
                <p className="text-sm text-red-600">
                  ✗ Domain is not available
                </p>
              )}
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerify}
              disabled={
                !selectedCountry || !name || name.length < 3 || !address
              }
              className="w-full bg-white hover:bg-gray-100 text-black disabled:opacity-50"
              size="lg"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Verify Identity
            </Button>

            {/* Verification Card Modal */}
            {showVerificationCard && address && name && name.length >= 3 && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-4xl relative">
                  {/* Close Button */}
                  <button
                    onClick={() => setShowVerificationCard(false)}
                    className="absolute top-4 right-4 w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors duration-200 z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-sky-400 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-black" />
                    </div>
                    <CardTitle className="text-2xl">
                      Verification Initiated
                    </CardTitle>
                    <CardDescription>
                      Your identity verification process has begun
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Self
                      userId={address}
                      userDefinedData={name}
                      handleSuccess={handleSuccess}
                      handleError={handleError}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
