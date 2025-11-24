'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, BookOpen, Pill, Star, Settings, Search, LogIn, LayoutDashboard, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

const navLinks = [
  { href: '/pharmacies', label: 'Pharmacies', icon: Pill },
  { href: '/medication-info', label: 'Infos Médicaments', icon: FileText },
  { href: '/product-search', label: 'Chercher Produit', icon: Search },
  { href: '/health-library', label: 'Fiches Santé', icon: BookOpen },
  { href: '/feedback', label: 'Avis', icon: Star },
];

const adminLinks = [
    { href: '/admin', label: 'Options', icon: Settings },
];

export function Header() {
  const pathname = usePathname();

  const NavLinks = ({ inSheet = false }: { inSheet?: boolean }) => (
    <>
    {navLinks.map(({ href, label, icon: Icon }) => (
      <Button
        key={href}
        variant="ghost"
        asChild
        className={cn(
          'font-semibold tracking-wide',
          pathname === href
            ? 'text-accent hover:text-accent'
            : 'text-foreground/70 hover:text-foreground',
          inSheet && 'w-full justify-start text-base'
        )}
      >
        <Link href={href}>
          {Icon && <Icon className="mr-2 h-5 w-5" />}
          {label}
        </Link>
      </Button>
    ))}
    {adminLinks.map(({ href, label, icon: Icon }) => (
      <Button
        key={href}
        variant="ghost"
        asChild
        className={cn(
          'font-semibold tracking-wide',
          pathname === href
            ? 'text-accent hover:text-accent'
            : 'text-foreground/70 hover:text-foreground',
          inSheet && 'w-full justify-start text-base'
        )}
      >
        <Link href={href}>
          {Icon && <Icon className="mr-2 h-5 w-5" />}
          {label}
        </Link>
      </Button>
    ))}
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="PharmaGuard Logo" width={28} height={28} className="h-7 w-7" />
          <span className="text-xl font-bold text-accent font-headline">
            PharmaGuard
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 md:flex">
            <NavLinks />
          </nav>
           <Button asChild variant="outline" className="hidden md:flex">
              <Link href="/pharmacist-dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Espace Pharmacien
              </Link>
            </Button>
          <ThemeToggle />
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-4 py-6">
                  <NavLinks inSheet />
                   <div className="border-t pt-4">
                     <Button asChild variant="outline" className="w-full justify-center">
                        <Link href="/pharmacist-dashboard">
                            <LayoutDashboard className="mr-2 h-4 w-4" /> Espace Pharmacien
                        </Link>
                     </Button>
                   </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
