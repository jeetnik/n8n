"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { BACKEND_URL } from "@/app/config/api";
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

function SignupContent() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await axios.post(
        `${BACKEND_URL}/api/v1/auth/signup`,
        {
          name: `${firstName} ${lastName}`.trim(),
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );
      router.push("/signin");
    } catch (err: unknown) {
      console.error("Signup error:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Signup failed");
      } else {
        setError("Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-teal-50 via-white to-blue-50">
      <div className="flex flex-col gap-6 w-full max-w-md">
        <svg className="self-center" width="80" height="30" viewBox="0 0 80 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="20" width="18" height="4" fill="#0d9488" />
          <text x="18" y="24" fill="#201515" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="35">nEn</text>
        </svg>
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Create an account</CardTitle>
            <CardDescription className="text-center">
              Enter your information below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </Field>
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
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <FieldDescription>
                    Must be at least 8 characters long.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirm-password">
                    Confirm Password
                  </FieldLabel>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Field>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
                )}
                <Field>
                  <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white">
                    {loading ? "Creating..." : "Create Account"}
                  </Button>
                  <GoogleSignInButton
                    text="signup_with"
                    onError={(err) => setError(err)}
                  />
                  <FieldDescription className="text-center">
                    Already have an account?{" "}
                    <Link href="/signin" className="underline underline-offset-4 hover:text-primary">
                      Sign in
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

export default function SignupPage() {
  return (
    <PublicRoute>
      <SignupContent />
    </PublicRoute>
  );
}
