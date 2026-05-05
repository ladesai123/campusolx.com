"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/shared/Toast";
import { Loader2 } from "lucide-react";
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
import { ArrowLeft, AlertCircle } from "lucide-react";
import { updateProductAction } from "./actions";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function EditProductForm({ product }: { product: any }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const [availability, setAvailability] = useState(product.available_from ? "future" : "now");
  const [availableDate, setAvailableDate] = useState(product.available_from ? product.available_from.split("T")[0] : "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [price, setPrice] = useState(product.price?.toString() || '');
  const [mrp, setMrp] = useState(product.mrp?.toString() || '');
  const [priceError, setPriceError] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState(product.whatsapp_number || '');
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const validatePrice = (priceValue: string, mrpValue: string) => {
    setPriceError(null);
    
    if (!priceValue) return true; // Price is required, but we let form validation handle that
    
    const priceNum = parseFloat(priceValue);
    const mrpNum = parseFloat(mrpValue);
    
    // Only validate if MRP is provided and both values are valid numbers
    if (mrpValue && !isNaN(mrpNum) && !isNaN(priceNum)) {
      if (priceNum >= mrpNum) {
        setPriceError('Your Price must be less than MRP');
        return false;
      }
    }
    
    return true;
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPrice(value);
    validatePrice(value, mrp);
  };

  const handleMrpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setMrp(value);
    validatePrice(price, value);
  };

  // Intercept form submit to show toast
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // Validate price before submission
    if (!validatePrice(price, mrp)) {
      return; // Don't submit if price validation fails
    }
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    setIsSubmitting(true);
    // Use the server action
    try {
      await updateProductAction(formData);
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (error) {
      console.error("Failed to update product:", error);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      {showSuccess && (
        <Toast 
          message="Product updated successfully! ✨" 
          onClose={() => setShowSuccess(false)} 
        />
      )}
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Edit Your Listing</CardTitle>
          <CardDescription>Update the details of your item below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6" suppressHydrationWarning>
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
                <Label htmlFor="price">Your Price (₹)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={price}
                  onChange={handlePriceChange}
                  required
                  className={priceError ? 'border-red-500' : ''}
                />
                <p className="text-[10px] text-gray-500">A reasonable price sells faster!</p>
                {priceError && (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {priceError}
                  </span>
                )}
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="mrp">Original MRP (₹)</Label>
                <Input 
                  id="mrp" 
                  name="mrp" 
                  type="number" 
                  value={mrp}
                  onChange={handleMrpChange}
                  required
                />
                <p className="text-[10px] text-gray-500">Buyers love seeing the discount they get!</p>
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
                  <Label htmlFor="available_date" className="mb-2 block">Available From:</Label>
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
            {/* New negotiable option section */}
            <div className="grid w-full items-center gap-2.5 rounded-lg border p-4">
              <Label className="font-semibold">Is the price negotiable?</Label>
              <RadioGroup name="is_negotiable" defaultValue={String(product.is_negotiable)} className="flex gap-4">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="true" id="negotiable-yes" /><Label htmlFor="negotiable-yes">Yes, negotiable</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="false" id="negotiable-no" /><Label htmlFor="negotiable-no">No, fixed price</Label></div>
              </RadioGroup>
            </div>
            {/* WhatsApp Number Field */}
            <div className="grid w-full items-center gap-2.5 rounded-lg border p-4 bg-slate-50/50">
              <Label className="font-semibold flex items-center flex-wrap gap-2" htmlFor="whatsapp_number">
                📱 WhatsApp Contact
              </Label>
              <div className="flex gap-2">
                <Input
                  id="whatsapp_number"
                  name="whatsapp_number"
                  type="tel"
                  placeholder="e.g. 8978725681"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  className="bg-white"
                />
                {whatsappNumber && (
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 text-red-500 hover:text-red-700 hover:border-red-300 bg-white"
                    onClick={() => setWhatsappNumber('')}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <span className="font-semibold text-green-700">Recommended:</span> Items with WhatsApp sell <span className="font-bold underline text-green-700">10x faster</span>. 
                Buyers reach you instantly, and your number is only shown to verified students.
              </p>
            </div>
            <p className="text-xs text-slate-500">Note: Image editing is not yet supported.</p>
            <div className="flex justify-end gap-2 mt-2">
              <Button asChild variant="ghost">
                <Link href="/profile">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                </Link>
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}