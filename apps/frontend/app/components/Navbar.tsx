"use client";

import * as React from "react"
import Link from "next/link"
import { cn } from "@/app/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/app/components/ui/navigation-menu"
import { Button } from "@/app/components/ui/button"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Workflow Automation",
    href: "/features/workflow-automation",
    description: "Build complex workflows with a visual editor.",
  },
  {
    title: "AI Agents",
    href: "/features/ai-agents",
    description: "Create powerful AI agents that can interact with your data.",
  },
  {
    title: "Integrations",
    href: "/integrations",
    description: "Connect with over 500+ apps and services.",
  },
  {
    title: "Self-Hosting",
    href: "/self-hosting",
    description: "Keep your data secure by hosting on your own infrastructure.",
  },
]

export default function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-2 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <svg width="80" height="28" viewBox="0 0 80 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect y="20" width="18" height="4" fill="#0d9488" />
            <text x="18" y="24" fill="#201515" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="26">nEn</text>
          </svg>
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="text-xl font-extrabold">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent">Features</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-teal-50 to-teal-100 p-6 no-underline outline-none focus:shadow-md"
                        href="#"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium text-teal-900">
                          nEn Platform
                        </div>
                        <p className="text-sm leading-tight text-teal-700">
                          The workflow automation platform for technical teams.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="#" title="Workflow Editor">
                    Visual node-based editor for complex logic.
                  </ListItem>
                  <ListItem href="#" title="AI Capabilities">
                    Native support for LLMs and vector stores.
                  </ListItem>
                  <ListItem href="#" title="API & Webhooks">
                    Trigger workflows via webhooks or API calls.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent">Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                  {components.map((component) => (
                    <ListItem
                      key={component.title}
                      title={component.title}
                      href={component.href}
                    >
                      {component.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent")}>
                <Link href="#">
                  Documentation
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent")}>
                <Link href="#">
                  Pricing
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" className="bg-none">
          <Link href="/signin">Login</Link>
        </Button>
        <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white rounded-3xl">
          <Link href="/signup">Sign up</Link>
        </Button>
      </div>
    </div>
  )
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
  )
})
ListItem.displayName = "ListItem"
