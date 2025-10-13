"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BrandName from "@/components/shared/BrandName";
import { createClient } from "@/lib/client";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);

  // Fetch user on mount (client-side)
  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user || error) {
        router.replace("/login");
      } else {
        setUser(user);
      }
    }
    fetchUser();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string) || "";
    const university = (formData.get("university") as string) || "";
    const year = (formData.get("year") as string) || "";
    const supabase = createClient();
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      name,
      university,
      year,
      profile_picture_url: user.user_metadata?.avatar_url || "",
      email: user.email || "",
    });
    setLoading(false);
    if (error) {
      alert("Failed to complete onboarding");
      return;
    }
    // Redirect to intended destination or home
    const redirectParam = searchParams.get('redirect');
    const finalDestination = redirectParam || '/home';
    console.log('🔗 Onboarding redirecting to:', finalDestination);
    router.replace(finalDestination);
  }

  if (!user) return null;
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">One Last Step</CardTitle>
          <CardDescription>Complete your profile to start using <BrandName inline />.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email || ""} disabled />
            </div>

            {/* Full Name Field */}
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={user.user_metadata?.full_name || ""}
                required
              />
            </div>

            {/* Campus Selection Field - Now a hidden input */}
            <Input
              type="hidden"
              name="university"
              value="SASTRA University, Thanjavur"
            />

            {/* Display the fixed university to the user */}
            <div className="grid w-full items-center gap-1.5">
              <Label>Campus</Label>
              <Input
                type="text"
                value="SASTRA University, Thanjavur"
                disabled
                className="bg-slate-100"
              />
            </div>

            {/* Year Dropdown */}
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="year">Year</Label>
              <Select name="year" required>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select your year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st Year">1st Year</SelectItem>
                  <SelectItem value="2nd Year">2nd Year</SelectItem>
                  <SelectItem value="3rd Year">3rd Year</SelectItem>
                  <SelectItem value="4th Year">4th Year</SelectItem>
                  <SelectItem value="Graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button with loading spinner */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && (
                <svg className="animate-spin mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              )}
              Complete Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
