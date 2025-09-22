"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowRight } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {siteConfig.header.map((item, index) => (
          <NavigationMenuItem key={index}>
            {item.trigger ? (
              <>
                <NavigationMenuTrigger>
                  <span className="flex items-center gap-2">
                    {item.trigger}
                    <span className="h-1.5 w-1.5 rounded-full bg-accent/80 shadow-[0_0_12px_2px_rgba(186,147,67,0.35)]" />
                  </span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="p-3 md:w-[460px] lg:w-[600px]">
                    {item.content.main && (
                      <NavigationMenuLink asChild>
                        <Link href={item.content.main.href} className="block rounded-md border bg-background/60 p-3 no-underline hover:bg-accent/5 transition-colors">
                          <div className="flex items-center gap-2">
                            {item.content.main.icon}
                            <div className="text-sm font-semibold">{item.content.main.title}</div>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground leading-snug">
                            {item.content.main.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    )}
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {item.content.items.map((subItem, subIndex) => (
                        <NavigationMenuLink asChild key={subIndex}>
                          <Link href={subItem.href} className="block rounded-md p-3 no-underline hover:bg-accent/10 transition-colors">
                            <div className="text-sm font-medium leading-tight">{subItem.title}</div>
                            <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{subItem.description}</p>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink asChild>
                <Link
                  href={item.href || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  title={item.label}
                  className={navigationMenuTriggerStyle()}
                >
                  <span className="flex items-center [&_svg]:size-4">
                    {item.icon}
                    <span className="sr-only">{item.label}</span>
                  </span>
                </Link>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = "ListItem";
