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
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-2 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <svg width="80" height="28" viewBox="0 0 80 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect y="20" width="18" height="4" fill="#0d9488" />
            <text x="18" y="24" fill="#ffffff" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="26">nEn</text>
          </svg>
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="text-xl font-extrabold">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-gray-200 hover:text-white hover:bg-white/10 data-[state=open]:bg-white/10">Features</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] bg-zinc-950 border border-zinc-800">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-teal-900/50 to-teal-900/20 p-6 no-underline outline-none focus:shadow-md border border-teal-900/50"
                        href="#"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium text-teal-100">
                          nEn Platform
                        </div>
                        <p className="text-sm leading-tight text-teal-200/80">
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
              <NavigationMenuTrigger className="bg-transparent text-gray-200 hover:text-white hover:bg-white/10 data-[state=open]:bg-white/10">Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-zinc-950 border border-zinc-800">
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
              <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent text-gray-200 hover:text-white hover:bg-white/10")}>
                <Link href="#">
                  Documentation
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent text-gray-200 hover:text-white hover:bg-white/10")}>
                <Link href="#">
                  Pricing
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" className="bg-none text-gray-200 hover:text-white hover:bg-white/10">
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
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-white/5 hover:text-teal-400 focus:bg-white/5 focus:text-teal-400 text-gray-200",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none text-gray-100">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-gray-400">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
