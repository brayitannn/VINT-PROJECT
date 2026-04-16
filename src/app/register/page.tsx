"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="h-screen flex flex-col md:flex-row relative w-full overflow-hidden bg-[var(--bg-primary)]">
      <style jsx global>{`
        .vint-input::placeholder {
          color: var(--text-muted) !important;
          opacity: 0.7;
          font-weight: 500;
        }
        .vint-input:focus {
          box-shadow: 0 0 0 2px var(--accent) !important;
          border-color: transparent !important;
          background-color: transparent !important;
        }
        .shadow-soft:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px color-mix(in srgb, var(--accent) 30%, transparent);
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      
      {/* Left Section - Imagen */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-out sm:scale-105"
          style={{ backgroundImage: "url('/img/bg-register.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        
        {/* Logo overlay on image */}
        <div className="absolute top-12 left-12 z-20">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 
                className="text-[48px] font-bold tracking-tighter leading-none font-display text-white" 
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
              >
                  vint
              </h1>
            </Link>
        </div>

        <div className="absolute bottom-20 left-12 z-20 max-w-md">
            <h2 className="text-4xl font-bold text-white leading-tight font-display mb-4">
                Redefinimos lo retro,<br/>inspiramos el futuro.
            </h2>
            <p className="text-lg text-white/80 font-medium">
                La comunidad de moda vintage más grande de Colombia te está esperando.
            </p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center relative z-10 h-full overflow-y-auto">
         
         {/* Mobile Logo Only */}
         <div className="md:hidden flex flex-col items-center pt-12 mb-4 animate-fade-in-up">
            <Link href="/">
              <h1 className="text-[48px] font-bold tracking-tighter text-[var(--accent)] font-display">vint</h1>
            </Link>
         </div>
         
         <div className="animate-fade-in-up w-full flex flex-1 justify-center items-center pt-32 pb-12 px-6 sm:px-12" style={{ animationDelay: "0.1s" }}>
           <Suspense fallback={<div className="py-20"><Loader2 className="w-12 h-12 animate-spin text-[var(--accent)]" /></div>}>
             <RegisterForm />
           </Suspense>
         </div>

      </div>
    </div>
  )
}