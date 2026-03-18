"use client";

import { useState } from "react";
import Image from "next/image";
import { Bars3Icon, XMarkIcon } from "@repo/ui/icons";

const navLinks = [
  { href: "#features", label: "Características" },
  { href: "#how-it-works", label: "Cómo funciona" },
  { href: "#pricing", label: "Precios" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="fixed left-4 right-4 top-4 z-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl bg-white/80 px-6 py-4 shadow-lg shadow-zinc-900/5 backdrop-blur-md">
        <a href="#" className="flex items-center gap-2">
          <Image
            src="/omaf-light.png"
            alt="OMA Finance"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </a>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="cursor-pointer text-sm font-medium text-zinc-600 transition-colors duration-200 hover:text-zinc-900"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#cta"
            className="cursor-pointer rounded-full bg-brand-red px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-red-dark"
          >
            Comenzar gratis
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 md:hidden"
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu dropdown */}
      <div
        className={`mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl bg-white/95 shadow-lg shadow-zinc-900/5 backdrop-blur-md transition-all duration-300 ease-out md:hidden ${
          isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col p-4">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 text-base font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#cta"
            onClick={closeMenu}
            className="mt-2 rounded-full bg-brand-red px-5 py-3 text-center text-base font-semibold text-white transition-colors duration-200 hover:bg-brand-red-dark"
          >
            Comenzar gratis
          </a>
        </div>
      </div>
    </header>
  );
}
