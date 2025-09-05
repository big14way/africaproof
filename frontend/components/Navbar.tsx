import { CustomConnectButton } from "./ConnectButton";
import Image from "next/image";

export const Navbar = () => {
  return (
    <nav className="relative z-10 flex items-center justify-between p-6 lg:px-12 bg-transparent rounded-full">
      <a href="/">
        <div className="flex items-center space-x-2">
          <Image
            src="/LatAmLogo.png"
            alt="African Proof Logo"
            width={32}
            height={32}
            className="drop-shadow-lg"
          />
          <span className="text-2xl font-bold text-teal-400 drop-shadow-lg">
            African Proof
          </span>
        </div>
      </a>

      <div className="hidden md:flex items-center space-x-10">
        <a
          href="/verify"
          className="text-white/90 hover:text-teal-300 transition-all duration-300 hover:scale-105 font-medium"
        >
          Verify
        </a>
        <a
          href="/example"
          className="text-white/90 hover:text-teal-300 transition-all duration-300 hover:scale-105 font-medium"
        >
          Example
        </a>
        <a
          href="/integration"
          className="text-white/90 hover:text-teal-300 transition-all duration-300 hover:scale-105 font-medium"
        >
          Integrate
        </a>
      </div>

      <div className="flex items-center">
        <CustomConnectButton />
      </div>
    </nav>
  );
};
