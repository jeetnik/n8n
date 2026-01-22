"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BACKEND_URL } from "@/app/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { User, Mail, Calendar, LogOut } from "lucide-react";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

interface UserData {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

function ProfileContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/api/v1/auth/me`, {
          withCredentials: true,
        });
        setUser(res.data.userdata);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load profile information");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/auth/logout`,
        {},
        { withCredentials: true }
      );
      router.push("/signin");
    } catch (err) {
      console.error("Logout error:", err);
      router.push("/signin");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-teal-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Card className="w-96 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 rounded bg-teal-600"></div>
            <h2 className="text-2xl font-semibold text-gray-800">Profile</h2>
          </div>
        </div>

        <Card className="border-teal-100 shadow-md">
          <CardHeader className="border-b bg-teal-50/30">
            <CardTitle className="flex items-center gap-3 text-teal-700">
              <div className="h-12 w-12 rounded-full bg-teal-500 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <span>User Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {user?.name && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-800">{user.name}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium text-gray-800">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium text-gray-800">
                  {user?.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-mono text-sm text-gray-600 truncate">
                  {user?.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-2 border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
