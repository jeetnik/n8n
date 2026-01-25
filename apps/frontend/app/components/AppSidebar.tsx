"use client";

import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/app/config/api";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/app/components/ui/sidebar";
import { useSidebar } from "@/app/components/ui/sidebar";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
];

interface UserData {
  id: string;
  email: string;
  name?: string;
}

const getInitials = (name: string | undefined) => {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (parts.length >= 2 && first && last) {
    return (first.charAt(0) + last.charAt(0)).toUpperCase();
  }
  return first ? first.charAt(0).toUpperCase() : "U";
};

const getRandomColor = (name: string | undefined) => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
  ];
  if (!name) return colors[0];
  const charSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charSum % colors.length];
};

export function AppSidebar() {
  const { state } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/v1/auth/me`, {
          withCredentials: true,
        });
        setUser(res.data.userdata);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  const handleProfile = () => {
    router.push("/profile");
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="hover:bg-white/5">
        <div className={`flex items-center ${state === "collapsed" ? "justify-center" : "justify-between"}`}>
          {state === "expanded" && (
            <SidebarGroupLabel>
              <div className="flex items-center pl-0">
                <img src="/n8n-color.svg" alt="n8n" width={24} height={24} className="object-contain invert brightness-0" />
              </div>
            </SidebarGroupLabel>
          )}
          <SidebarTrigger className={state === "expanded" ? "ml-[-50px]" : ""} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon className={isActive ? "text-white" : "text-gray-400"} />
                        <span className={`text-base ${isActive ? "text-white font-medium" : "text-gray-400"}`}>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <button
          onClick={handleProfile}
          className={`flex items-center gap-3 p-2 hover:bg-white/10 transition-colors w-full rounded-md ${state === "collapsed" ? "justify-center" : ""}`}
        >
          <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getRandomColor(user?.name)}`}>
            {getInitials(user?.name)}
          </div>
          {state === "expanded" && (
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span className="font-medium text-sm truncate w-full text-white">
                {user?.name || "User"}
              </span>
            </div>
          )}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}