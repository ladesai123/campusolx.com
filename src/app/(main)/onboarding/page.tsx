// src/app/onboarding/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
import { createClient } from "@/lib/server";
import BrandName from '@/components/shared/BrandName';

export default async function OnboardingPage() {
  // Await cookies first (required by Next.js)
  const cookieStore = cookies();

  const supabase = await createClient();

  // Get the authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");

  // Server action to complete onboarding
  const completeOnboarding = async (formData: FormData) => {
    "use server";

    const name = (formData.get("name") as string) || "";
    const university = (formData.get("university") as string) || "";

    const cookieStore = cookies();
    const supabase = await createClient();

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      name,
      university,
      profile_picture_url: user.user_metadata?.avatar_url || "",
    });

    if (error) {
      console.error("Supabase upsert error:", error);
      throw new Error("Failed to complete onboarding");
    }

    redirect("/home");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">One Last Step</CardTitle>
          <CardDescription>Complete your profile to start using <BrandName inline />.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={completeOnboarding} className="flex flex-col gap-6">
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

            {/* Submit Button */}
            <Button type="submit" className="w-full">
              Complete Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
