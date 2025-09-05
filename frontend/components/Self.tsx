"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getUniversalLink } from "@selfxyz/core";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
} from "@selfxyz/qrcode";
import { SelfRegistrar } from "@/lib/const";

interface SelfProps {
  userId: string;
  userDefinedData: string;
  handleSuccess: () => void;
  handleError: () => void;
}

export default function Self({
  userId,
  userDefinedData,
  handleSuccess,
  handleError,
}: SelfProps) {
  const router = useRouter();
  const [linkCopied, setLinkCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");

  // Use useEffect to ensure code only executes on the client side
  useEffect(() => {
    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: "African Proof",
        scope: "hello",
        endpoint: SelfRegistrar,
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png", // url of a png image, base64 is accepted but not recommended
        userId: userId,
        endpointType: "staging_celo",
        userIdType: "hex", // use 'hex' for ethereum address or 'uuid' for uuidv4
        userDefinedData: userDefinedData,
        disclosures: {
          minimumAge: 18,
          nationality: true,
        },
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
    }
  }, [userId, userDefinedData]);

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyToClipboard = () => {
    if (!universalLink) return;

    navigator.clipboard
      .writeText(universalLink)
      .then(() => {
        setLinkCopied(true);
        displayToast("Universal link copied to clipboard!");
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        displayToast("Failed to copy link");
      });
  };

  const openSelfApp = () => {
    if (!universalLink) return;

    window.open(universalLink, "_blank");
    displayToast("Opening Self App...");
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Main content */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
          {/* Left Column - QR Code */}
          <div className="flex-shrink-0">
            {selfApp ? (
              <div className="bg-white p-6 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <SelfQRcodeWrapper
                  selfApp={selfApp}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              </div>
            ) : (
              <div className="w-[280px] h-[280px] bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center rounded-xl">
                <p className="text-gray-500 text-sm font-medium">
                  Loading QR Code...
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Buttons and User Address */}
          <div className="flex flex-col gap-6 min-w-0 flex-1">
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={copyToClipboard}
                disabled={!universalLink}
                className="w-full bg-gray-800 hover:bg-gray-700 active:bg-gray-900 transition-all duration-200 text-white p-4 rounded-xl text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {linkCopied ? "Copied!" : "Copy Universal Link"}
              </button>

              <button
                type="button"
                onClick={openSelfApp}
                disabled={!universalLink}
                className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-all duration-200 text-white p-4 rounded-xl text-sm font-semibold disabled:bg-blue-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Open Self App
              </button>
            </div>

            {/* User Address Section */}
            <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/30 backdrop-blur-sm rounded-xl p-5 border border-gray-600/40 shadow-lg">
              <div className="flex flex-col items-center gap-3">
                <span className="text-gray-300 text-xs uppercase tracking-wider font-semibold">
                  User Address
                </span>
                <div className="bg-gray-900/60 rounded-lg px-4 py-3 w-full text-center break-all text-sm font-mono text-gray-100 border border-gray-500/40 shadow-inner">
                  {userId ? (
                    userId
                  ) : (
                    <span className="text-gray-400">Not connected</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white py-3 px-4 rounded-xl shadow-2xl text-sm z-50 border border-gray-600/50 backdrop-blur-sm animate-fade-in">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
