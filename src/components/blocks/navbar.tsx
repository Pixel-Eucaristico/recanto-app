import { Menu } from "lucide-react";

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
} from "@/_config/routes";
import SmartLink from "../common/SmartLink";
import Image from "next/image";
import ThemeController from "../ui/daisyui/theme-controller";

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
  auth = authNavbar,
}: NavbarProps) => {
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
          <div className="flex gap-2">
            <ThemeController />
            <Button asChild variant="outline" size="sm">
              <SmartLink href={auth.login.url}>{auth.login.text}</SmartLink>
            </Button>
            <Button asChild size="sm">
              <SmartLink href={auth.signup.url}>{auth.signup.text}</SmartLink>
            </Button>
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
                    <Button asChild variant="outline" className="text-white">
                      <SmartLink href={auth.login.url}>
                        {auth.login.text}
                      </SmartLink>
                    </Button>
                    <Button asChild>
                      <SmartLink href={auth.signup.url}>
                        {auth.signup.text}
                      </SmartLink>
                    </Button>
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
            <NavigationMenuLink>
              {item.items.map((subItem) => (
                <li key={subItem.title}>
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
                </li>
              ))}
            </NavigationMenuLink>
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
