"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Link,
} from "@heroui/react";
import { MagneticButton } from "../animations/magnetic-button";

const menuItems = [
  { label: "Funcionalidades", href: "#features" },
  { label: "Precios", href: "#pricing" },
  { label: "Blog", href: "/blog" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <HeroNavbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className="fixed top-0 bg-background/80 backdrop-blur-lg border-b border-default-200/50"
      maxWidth="xl"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/omaf-light.png"
              alt="OMA Finance"
              width={80}
              height={80}
              className="dark:hidden h-10 w-auto"
            />
            <Image
              src="/omaf-dark.png"
              alt="OMA Finance"
              width={80}
              height={80}
              className="hidden dark:block h-10 w-auto"
            />
          </motion.div>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-8" justify="center">
        {menuItems.map((item, index) => (
          <NavbarItem key={item.label}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className="text-default-600 hover:text-foreground transition-colors font-medium"
              >
                {item.label}
              </Link>
            </motion.div>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden sm:flex">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/login" className="text-default-600 hover:text-foreground font-medium">
              Iniciar sesión
            </Link>
          </motion.div>
        </NavbarItem>
        <NavbarItem>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <MagneticButton strength={0.15}>
              <Button color="primary" variant="flat" className="font-semibold">
                Registrarse
              </Button>
            </MagneticButton>
          </motion.div>
        </NavbarItem>
      </NavbarContent>

      <AnimatePresence>
        {isMenuOpen && (
          <NavbarMenu className="pt-6">
            {menuItems.map((item, index) => (
              <NavbarMenuItem key={item.label}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className="w-full text-lg py-2 text-default-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              </NavbarMenuItem>
            ))}
            <NavbarMenuItem>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, delay: menuItems.length * 0.05 }}
              >
                <Link href="/login" className="w-full text-lg py-2 text-primary-500">
                  Iniciar sesión
                </Link>
              </motion.div>
            </NavbarMenuItem>
          </NavbarMenu>
        )}
      </AnimatePresence>
    </HeroNavbar>
  );
}
