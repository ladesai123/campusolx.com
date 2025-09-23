"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
// Simple toast component
function SuccessToast({ show, message }: { show: boolean; message: string }) {
  return (
    <div
      className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded bg-green-600 px-6 py-3 text-white shadow-lg transition-all duration-500 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      style={{ minWidth: 220, textAlign: 'center' }}
    >
      {message}
    </div>
  );
}
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
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { updateProductAction } from "./actions";

export default function EditProductForm({ product }: { product: any }) {
  const [availability, setAvailability] = useState(product.available_from ? "future" : "now");
  const [availableDate, setAvailableDate] = useState(product.available_from ? product.available_from.split("T")[0] : "");
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // Intercept form submit to show toast
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    // Use the server action
    const res = await updateProductAction(formData);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      router.push("/profile");
    }, 3000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <SuccessToast show={showSuccess} message="Product updated successfully!" />
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Edit Your Listing</CardTitle>
          <CardDescription>Update the details of your item below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
            <input type="hidden" name="productId" value={product.id} />
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="title">Item Title</Label>
              <Input id="title" name="title" type="text" defaultValue={product.title} required />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={product.description || ""}
              />
            </div>
            {/* Move category selector below description for consistency */}
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={product.category || ""} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Books & Notes">Books & Notes</SelectItem>
                  <SelectItem value="Hostel & Room Essentials">Hostel & Room Essentials</SelectItem>
                  <SelectItem value="Mobility">Mobility</SelectItem>
                  <SelectItem value="Fashion & Accessories">Fashion & Accessories</SelectItem>
                  <SelectItem value="Lab & Academics">Lab & Academics</SelectItem>
                  <SelectItem value="Hobbies & Sports">Hobbies & Sports</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="mrp">MRP (Optional)</Label>
                <Input id="mrp" name="mrp" type="number" defaultValue={product.mrp || ""} />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="price">Your Price (₹)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  defaultValue={product.price || ""}
                  required
                />
              </div>
            </div>

            {/* Only show availability toggle (no status radio group) */}
            <div className="grid w-full items-center gap-2.5 rounded-lg border p-4">
              <Label className="font-semibold">Availability</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="availability"
                    value="now"
                    checked={availability === "now"}
                    onChange={() => setAvailability("now")}
                  />
                  <span>Available Now</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="availability"
                    value="future"
                    checked={availability === "future"}
                    onChange={() => setAvailability("future")}
                  />
                  <span>Reserve for Future</span>
                </label>
              </div>
              {availability === "future" && (
                <div className="mt-2">
                  <Label htmlFor="available_date">Available From:</Label>
                  <Input
                    id="available_date"
                    name="available_date"
                    type="date"
                    value={availableDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setAvailableDate(e.target.value)}
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500">Note: Image editing is not yet supported.</p>
            <div className="flex justify-end gap-2 mt-2">
              <Button asChild variant="ghost">
                <Link href="/profile">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                </Link>
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}