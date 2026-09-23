'use client';

import { useEffect, useState } from 'react';
import { site } from '@/content/site';

const STORAGE_KEY = 'singla_lawfirm_disclaimer_accepted_v1';

export function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const accepted = localStorage.getItem(STORAGE_KEY);
      if (!accepted) {
        setIsOpen(true);
      }
    } catch {
      // If localStorage is disabled/restricted, default to showing the disclaimer
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling when modal is active
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
    setIsOpen(false);
  };

  if (!mounted || !isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      aria-describedby="disclaimer-desc"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fade-in"
    >
      {/* Backdrop overlay with blur */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-2xl border border-line ring-1 ring-black/5 animate-scale-up">
        {/* Top gold accent line for law firm luxury touch */}
        <div className="h-1.5 w-full bg-gradient-to-r from-gold via-gold-400 to-gold" />

        <div className="p-6 sm:p-8 md:p-10 text-center">
          {/* Title */}
          <h2
            id="disclaimer-title"
            className="text-2xl sm:text-3xl md:text-4xl font-black tracking-wider text-[#111827] uppercase mb-6 sm:mb-8 font-sans"
          >
            DISCLAIMER
          </h2>

          {/* Body Text */}
          <div
            id="disclaimer-desc"
            className="text-sm sm:text-[0.9375rem] md:text-base leading-relaxed text-[#4b5563] text-justify space-y-4 mb-8 sm:mb-10 selection:bg-gold/20"
          >
            <p>
              The Bar Council of India does not permit advertisement or solicitation by advocates.
              By accessing this website ({site.url}/), you acknowledge and confirm that you are
              seeking information relating to {site.name}, Advocates and Legal Consultants
              (hereinafter referred to as &ldquo;{site.name}&rdquo;), of your own accord and that
              there has been no form of solicitation, advertisement, or inducement by{' '}
              {site.name}, or its members.
            </p>
            <p>
              The content of this website is for informational purposes only and should not be
              interpreted as soliciting or advertising. No material/information provided on this
              website should be construed as legal advice.{' '}
              {site.name} shall not be liable for the consequences of any action taken by relying
              on the material/information provided on this website.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center items-center">
            <button
              type="button"
              onClick={handleAccept}
              autoFocus
              className="inline-flex items-center justify-center px-8 sm:px-12 py-3.5 sm:py-4 text-sm sm:text-base font-bold uppercase tracking-wider text-white bg-[#e53935] hover:bg-[#d32f2f] active:bg-[#c62828] rounded-md shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-red-300 cursor-pointer"
            >
              I ACCEPT THE ABOVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
