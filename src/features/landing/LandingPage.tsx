"use client";

import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { BentoFeatures } from "./components/BentoFeatures";
import { StickyShowcase } from "./components/StickyShowcase";
import { ContactForm } from "./components/ContactForm";
import { Footer } from "./components/Footer";

export function LandingPage() {
  return (
    <div className="bg-[#050E1A] text-white min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <BentoFeatures />
      <StickyShowcase />
      <ContactForm />
      <Footer />
    </div>
  );
}
