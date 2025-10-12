"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle, Menu, X } from "lucide-react";
import Logo from "@/components/shared/Logo";

export default function LandingNavbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const closeMenu = () => setMenuOpen(false);

  // Close menu when window is resized to desktop view
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && menuOpen) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "Fresh On Campus", href: "#products" },
    { label: "How it works", href: "#howitworks" },
    { label: "Safety Tips", href: "#safety" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "About Us", href: "#about" },
    { label: "FAQs", href: "#faqs" },
    { label: "Help & Support", href: "mailto:campusolx.connect@gmail.com" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo size="lg" />
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          {menuItems.map(item => (
            <a key={item.label} href={item.href} className="text-sm text-gray-600 hover:text-blue-600 font-normal transition-colors">
              {item.label}
            </a>
          ))}
        </nav>
        
        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href="/sell">
              <PlusCircle className="h-4 w-4 mr-2" />
              Sell Item
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/home">Login</Link>
          </Button>
        </div>
        
        {/* Mobile Menu Button - transforms from hamburger to X */}
        <button
          className="md:hidden ml-2 p-2 text-gray-700 hover:text-blue-600 transition-all duration-200"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* --- MOBILE MENU OVERLAY --- */}
      {menuOpen && (
        <div className="md:hidden">
          {/* Semi-transparent backdrop - starts below navbar to preserve logo */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
            style={{
              top: '64px', // Start below the navbar (4rem = 64px)
            }}
            onClick={closeMenu}
            aria-hidden="true"
          />
          
          {/* Mobile menu panel - positioned on the right side */}
          <div 
            id="mobile-menu"
            className="fixed right-0 top-16 z-50 h-screen w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out"
            style={{
              boxShadow: '-10px 0 25px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            </div>
            
            {/* Menu items */}
            <nav className="flex flex-col px-6 py-4 space-y-1">
              {menuItems.map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            
            {/* Mobile Action Buttons */}
            <div className="border-t border-gray-100 px-6 py-4 space-y-3">
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href="/sell" onClick={closeMenu}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Sell Item
                </Link>
              </Button>
              <Button asChild size="sm" className="w-full">
                <Link href="/home" onClick={closeMenu}>Login</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}