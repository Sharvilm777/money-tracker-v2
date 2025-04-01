"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  PieChart, 
  CreditCard, 
  Wallet, 
  FileText, 
  LogOut, 
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    api.auth.logout();
  };

  const NavLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => {
    const isActive = pathname === href;
    
    return (
      <Link href={href}>
        <Button
          variant={isActive ? "default" : "ghost"}
          className={cn(
            "w-full justify-start gap-2",
            isActive && "bg-primary text-primary-foreground"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {icon}
          <span>{label}</span>
        </Button>
      </Link>
    );
  };

  // Mobile navigation link optimized for bottom bar
const NavLinkMobile = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => {
  const isActive = pathname === href;
  
  return (
    <Link href={href} className="flex flex-col items-center text-center">
      <div
        className={cn(
          "p-1 rounded-full",
          isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
        )}
      >
        {icon}
      </div>
      <span className={cn(
        "text-xs mt-1", 
        isActive ? "font-medium" : "font-normal"
      )}>
        {label}
      </span>
    </Link>
  );
};

  return (
    <>
      {/* Desktop Navbar (hidden on small screens) */}
      <div className="hidden md:flex h-screen w-64 flex-col border-r bg-background p-4 fixed">
        <div className="flex h-16 items-center px-4 font-bold text-2xl">
          <PieChart className="mr-2 h-6 w-6" /> FinTrack
        </div>
        <div className="space-y-2 flex-1">
          <NavLink href="/home" icon={<Home className="h-5 w-5" />} label="Home" />
          <NavLink href="/dashboard" icon={<PieChart className="h-5 w-5" />} label="Dashboard" />
          <NavLink href="/accounts" icon={<CreditCard className="h-5 w-5" />} label="Accounts" />
          <NavLink href="/budgets" icon={<Wallet className="h-5 w-5" />} label="Budgets" />
          <NavLink href="/transactions" icon={<FileText className="h-5 w-5" />} label="Transactions" />
        </div>
        <Button variant="ghost" className="justify-start gap-2" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>

      {/* Mobile Navbar - Fixed at bottom for easier thumb access */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <div className="flex items-center justify-between p-2">
          <NavLinkMobile href="/home" icon={<Home className="h-5 w-5" />} label="Home" />
          <NavLinkMobile href="/dashboard" icon={<PieChart className="h-5 w-5" />} label="Dashboard" />
          <NavLinkMobile href="/accounts" icon={<CreditCard className="h-5 w-5" />} label="Accounts" />
          <NavLinkMobile href="/budgets" icon={<Wallet className="h-5 w-5" />} label="Budgets" />
          <NavLinkMobile href="/transactions" icon={<FileText className="h-5 w-5" />} label="Transactions" />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden border-b bg-background p-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center font-bold text-xl">
            <PieChart className="mr-2 h-5 w-5" /> FinTrack
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content padding for desktop */}
      <div className="hidden md:block md:ml-64"></div>
      
      {/* Content padding for mobile - add bottom padding for the navbar */}
      <div className="md:hidden pb-16"></div>
    </>
  );
}



