"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { BACKEND_URL } from "@/app/config/api";
import { cn } from "@/app/lib/utils";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/app/components/ui/field";
import { Input } from "@/app/components/ui/input";
import { GoogleSignInButton } from "@/app/components/GoogleSignInButton";
import { PublicRoute } from "@/app/components/PublicRoute";

function SignInContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      await axios.post(
        `${BACKEND_URL}/api/v1/auth/signin`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Sign in error:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Sign in failed");
      } else {
        setError("Sign in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-teal-50 via-white to-blue-50">
      <div className={cn("flex flex-col gap-6 w-full max-w-md", className)} {...props}>
        <svg className="self-center" width="80" height="30" viewBox="0 0 80 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="20" width="18" height="4" fill="#0d9488" />
          <text x="18" y="24" fill="#201515" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="35">nEn</text>
        </svg>
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Sign in to your account</CardTitle>
            <CardDescription className="text-center">
              Enter your email below to Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Link href="/forgot-password" className="text-sm underline underline-offset-4 hover:text-teal-600">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Field>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
                )}
                <Field>
                  <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white">
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                  <GoogleSignInButton
                    text="signin_with"
                    onError={(err) => setError(err)}
                  />
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
                      Sign up
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <PublicRoute>
      <SignInContent />
    </PublicRoute>
  );
}
