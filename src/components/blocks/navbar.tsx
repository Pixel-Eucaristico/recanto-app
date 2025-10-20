'use client';

import { Menu, LayoutDashboard, User as UserIcon, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  authNavbar,
  logoNavbar,
  menuNavbar,
  mobileExtraLinksNavbar,
} from "@/_config/routes_main";
import SmartLink from "../common/SmartLink";
import Image from "next/image";
import ThemeController from "../ui/daisyui/theme-controller";
import { auth } from "@/domains/auth/services/firebaseClient";
import { onAuthStateChanged, User } from "firebase/auth";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ElementType;
  items?: MenuItem[];
}

interface NavbarProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  mobileExtraLinks?: {
    name: string;
    url: string;
  }[];
  auth?: {
    login: {
      text: string;
      url: string;
    };
    signup: {
      text: string;
      url: string;
    };
  };
}

const Navbar = ({
  logo = logoNavbar,
  menu = menuNavbar,
  mobileExtraLinks = mobileExtraLinksNavbar,
  auth: authConfig = authNavbar,
}: NavbarProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <section className="py-4">
      <div className="container">
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-6">
            <SmartLink href={logo.url} className="flex items-center gap-2">
              <Image
                src={logo.src}
                className="w-8"
                alt={logo.alt}
                width={32}
                height={32}
              />
              <span className="text-lg font-semibold">{logo.title}</span>
            </SmartLink>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {menu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <ThemeController />
            {!loading && (
              <>
                {user ? (
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-2">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-8 h-8 flex items-center justify-center">
                          <span className="text-sm font-semibold">
                            {(user.displayName || user.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        {(user.displayName || user.email?.split('@')[0] || 'Usuário').split(' ')[0]}
                      </span>
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-64 mt-2 border border-base-300">
                      <li className="menu-title px-3 py-2">
                        <span className="text-xs opacity-60 truncate max-w-full block">{user.email}</span>
                      </li>
                      <div className="divider my-0"></div>
                      <li>
                        <SmartLink href="/app/dashboard" className="gap-3 py-2">
                          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                          <span>Dashboard</span>
                        </SmartLink>
                      </li>
                      <li>
                        <a onClick={() => auth.signOut()} className="gap-3 py-2 text-error hover:bg-error/10">
                          <LogOut className="w-4 h-4 flex-shrink-0" />
                          <span>Sair</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <>
                    <Button asChild variant="outline" size="sm">
                      <SmartLink href={authConfig.login.url}>{authConfig.login.text}</SmartLink>
                    </Button>
                    <Button asChild size="sm">
                      <SmartLink href={authConfig.signup.url}>{authConfig.signup.text}</SmartLink>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </nav>
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <a href={logo.url} className="flex items-center gap-2">
              <Image
                src={logo.src}
                className="w-8"
                alt={logo.alt}
                width={32}
                height={32}
              />
              <span className="text-lg font-semibold">{logo.title}</span>
            </a>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <SmartLink
                      href={logo.url}
                      className="flex items-center gap-2"
                    >
                      <Image
                        src={logo.src}
                        className="w-8"
                        alt={logo.alt}
                        width={32}
                        height={32}
                      />
                      <span className="text-lg font-semibold">
                        {logo.title}
                      </span>
                    </SmartLink>
                  </SheetTitle>
                </SheetHeader>
                <div className="my-6 flex flex-col gap-6">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {menu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>
                  <div className="border-t py-4">
                    <div className="grid grid-cols-2 justify-start">
                      {mobileExtraLinks.map((link, idx) => (
                        <SmartLink
                          key={idx}
                          className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                          href={link.url}
                        >
                          {link.name}
                        </SmartLink>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <ThemeController />
                    {!loading && (
                      <>
                        {user ? (
                          <>
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-md border border-green-200">
                              <UserIcon className="w-5 h-5" />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {user.displayName || user.email?.split('@')[0]}
                                </span>
                                <span className="text-xs text-green-600">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                            <Button asChild className="gap-2">
                              <SmartLink href="/app/dashboard">
                                <LayoutDashboard className="w-4 h-4" />
                                Ir para Dashboard
                              </SmartLink>
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button asChild variant="outline" className="text-white">
                              <SmartLink href={authConfig.login.url}>
                                {authConfig.login.text}
                              </SmartLink>
                            </Button>
                            <Button asChild>
                              <SmartLink href={authConfig.signup.url}>
                                {authConfig.signup.text}
                              </SmartLink>
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="w-80 p-3">
            {item.items.map((subItem) => (
              <li key={subItem.title}>
                <NavigationMenuLink asChild>
                  <SmartLink
                    className="flex select-none gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                    href={subItem.url}
                  >
                    {subItem.icon && (
                      <subItem.icon className="size-5 shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-semibold">
                        {subItem.title}
                      </div>
                      {subItem.description && (
                        <p className="text-sm leading-snug">
                          {subItem.description}
                        </p>
                      )}
                    </div>
                  </SmartLink>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <a
      key={item.title}
      className="group inline-flex w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
      href={item.url}
    >
      {item.title}
    </a>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SmartLink
              key={subItem.title}
              className="flex select-none gap-4 rounded-md p-3 leading-none outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              href={subItem.url}
            >
              {subItem.icon && <subItem.icon className="size-5 shrink-0" />}
              <div>
                <div className="text-sm font-semibold">{subItem.title}</div>
                {subItem.description && (
                  <p className="text-sm leading-snug">{subItem.description}</p>
                )}
              </div>
            </SmartLink>
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <SmartLink key={item.title} href={item.url} className="font-semibold">
      {item.title}
    </SmartLink>
  );
};

export { Navbar };
