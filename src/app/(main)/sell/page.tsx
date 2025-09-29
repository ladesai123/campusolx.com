'use client'; 

import { useState, useTransition, useEffect, useRef } from 'react';
import { sellItemAction } from './actions'; 
import imageCompression from 'browser-image-compression';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Loader2, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import SharePopup from '@/components/shared/SharePopup';
import BrandName from '@/components/shared/BrandName';

export default function SellPage() {
  // --- All of your existing state variables ---
  // Refs for file inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categorySetByAI, setCategorySetByAI] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<File[]>([]);
  const [base64ImageData, setBase64ImageData] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [availability, setAvailability] = useState('now');
  const [fileError, setFileError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showReserveTip, setShowReserveTip] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [listedProduct, setListedProduct] = useState<{ id: number; title: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  // --- All your existing functions (handleFileChange, generateTitleAndDescription, handleSubmit) remain the same ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setFileError(null);
    setBase64ImageData(null);
    const imageFile = files[0];
    const options = { maxSizeMB: 1.5, maxWidthOrHeight: 1080, useWebWorker: true };
    try {
      const compressedFile = await imageCompression(imageFile, options);
      setCompressedFiles([compressedFile]);
      setFileError("");
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        const base64data = reader.result?.toString().split(',')[1];
        if (base64data) {
          setBase64ImageData(base64data);
          // Do NOT auto-generate title/desc. Only on sparkle click.
        }
      };
    } catch (error) {
      console.error('Image compression error:', error);
      setFileError('Image upload failed. Please try a different image or try again later.');
      setCompressedFiles([]);
      setBase64ImageData(null);
    }
  };

  const generateTitleAndDescription = async (imageData: string) => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData }),
      });
      if (!response.ok) {
        throw new Error("The AI generator is a bit busy right now. Please try again in a moment, or feel free to write your own!");
      }
      const { title, description, category } = await response.json();
      setTitle(title);
      setDescription(description);
      setCategory(category);
      setCategorySetByAI(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setAiError(errorMessage);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.delete('images');
    compressedFiles.forEach(file => {
      formData.append('images', file, file.name);
    });
    setSubmitError(null);
    startTransition(async () => {
      const result = await sellItemAction(formData);
      if (result?.success && result.product) {
        setListedProduct(result.product);
        setShowSharePopup(true);
      } else if (result?.error) {
        setSubmitError(result.error);
      } else {
        setSubmitError('Something went wrong. Please try again.');
      }
    });
  };
  
  const handleAvailabilityChange = (value: string) => {
    setAvailability(value);
    if (value === 'future' && !sessionStorage.getItem('hasSeenReserveTip')) {
      setShowReserveTip(true);
      sessionStorage.setItem('hasSeenReserveTip', 'true');
    }
  };

  return (
    <>
      {showSharePopup && listedProduct && (
        <SharePopup product={listedProduct} onClose={() => router.push('/home')} />
      )}

      {/* --- The "Golden Rule" Popup for Sellers with CORRECTED HTML --- */}
      <AlertDialog open={showReserveTip} onOpenChange={setShowReserveTip}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              💡 Pro-Tip: How to Reserve Safely
            </AlertDialogTitle>
            {/* THIS IS THE FIX: We use a wrapper <div> instead of nested <p> tags */}
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-2 text-sm text-muted-foreground">
                <div>You're listing this item for reservation. This is great! To protect yourself from buyers who aren't serious, we <strong>strongly recommend</strong> you do the following in your chat:</div>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Request a Commitment Deposit:</strong> Ask for a 20-30% non-refundable deposit via UPI to lock in the deal. This is your safety net if the buyer backs out.</li>
                  <li><strong>Set Clear Terms:</strong> Agree on the final price and the pickup date.</li>
                </ul>
                <div className="text-xs text-gray-500">Remember: You are in control of the deal. <BrandName inline /> does not handle payments and is not responsible for transactions. This agreement is between you and the buyer.</div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowReserveTip(false)}>Got It</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Show error if product listing fails */}
      {submitError && (
        <div className="mb-4 flex items-center text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>
            {submitError.includes('image')
              ? 'Image upload failed. Please try a different image or try again later.'
              : 'There was a problem listing your item. Please try again later.'}
          </span>
        </div>
      )}
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">List a New Item</CardTitle>
            <CardDescription>Fill out the details below to sell your item on <BrandName inline />.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* All your form fields (image, title, price, availability, etc.) */}
              {/* Step 1: Image Upload */}

              {/* Show file/image errors near the image upload field */}
              {fileError && (
                <div className="mb-2 flex items-center text-sm text-red-600 p-2 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}
              <div className="grid w-full items-center gap-1.5">
                <Label>1. Upload an Image</Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => cameraInputRef.current?.click()}>
                    Take Photo
                  </Button>
                  <span className="text-xs text-gray-500 font-semibold">or</span>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => galleryInputRef.current?.click()}>
                    Choose from Gallery
                  </Button>
                </div>
                {compressedFiles.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-slate-100 rounded border border-slate-200">
                    <img
                      src={URL.createObjectURL(compressedFiles[0])}
                      alt="Preview"
                      className="h-12 w-12 object-cover rounded"
                    />
                    <span className="text-xs text-gray-700 truncate max-w-[120px]">{compressedFiles[0].name}</span>
                    <span className="ml-2 text-xs text-green-600 font-medium">Uploaded!</span>
                    <button
                      type="button"
                      aria-label="Remove image"
                      className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold px-2 rounded focus:outline-none"
                      onClick={() => {
                        setCompressedFiles([]);
                        setBase64ImageData(null);
                        setTitle("");
                        setDescription("");
                        setAiError(""); // This ensures placeholder resets
                        setIsAiLoading(false);
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  required={compressedFiles.length === 0}
                  name="images"
                  id="camera-upload"
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  required={compressedFiles.length === 0}
                  name="images"
                  id="gallery-upload"
                />
                <span className="text-xs text-amber-600 mt-1 block">Due to storage limits, you can upload only <b>1 image</b>. Please choose the <b>best photo</b> of your item!</span>
              </div>


              {/* Step 2 & 3: AI Fields */}

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="title">2. Item Title</Label>
                <div className="relative">
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder={aiError ? "Please write yourself..." : "AI will generate this..."}
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="absolute right-1 top-1 h-7"
                    disabled={isAiLoading || !base64ImageData}
                    onClick={() => {
                      // If no image, do nothing (button is disabled, but double check)
                      if (!base64ImageData) {
                        alert('Please upload an image first.');
                        return;
                      }
                      generateTitleAndDescription(base64ImageData);
                    }}
                  >
                    {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  </Button>
                </div>
                <span className="text-xs text-gray-500 mt-1">Click <span className="inline-block align-middle"><Sparkles className="h-4 w-4 inline" /></span> to generate title, description, and category using AI.</span>
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="description">3. Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder={aiError ? "Please write yourself" : "AI will generate this..."}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {aiError && (<div className="flex items-center text-sm text-amber-600 mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md"><AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" /><span>{aiError}</span></div>)}
              </div>

              {/* Category Selector moved below description */}
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required value={category} onValueChange={val => { setCategory(val); setCategorySetByAI(false); }}>
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
                {categorySetByAI && (
                  <span className="text-xs text-green-600 mt-1">Category already selected by AI</span>
                )}
              </div>
              
              {/* Step 4: Pricing and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5"><Label htmlFor="price">Your Price (₹)</Label><Input id="price" name="price" type="number" placeholder="Enter 0 for 'Free'" required /></div>
            <div className="grid w-full items-center gap-1.5"><Label htmlFor="mrp">MRP (Optional)</Label><Input id="mrp" name="mrp" type="number" placeholder="e.g., 1000" /></div>
          </div>


              {/* Step 5: Availability */}
              <div className="grid w-full items-center gap-2.5 rounded-lg border p-4">
                <Label className="font-semibold">5. Availability</Label>
                <RadioGroup name="availability" value={availability} onValueChange={handleAvailabilityChange} className="flex gap-4">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="now" id="now" /><Label htmlFor="now">Available Now</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="future" id="future" /><Label htmlFor="future">Sell in Future</Label></div>
                </RadioGroup>
                {availability === 'future' && (
                  <div className="mt-2">
                    <Label htmlFor="available_date">Available From:</Label>
                    <Input
                      id="available_date"
                      name="available_date"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}
              </div>

              {/* CampusOlx Disclaimer and Agreement */}
              <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 my-2 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-yellow-800 font-semibold text-base">
                  <span role="img" aria-label="warning">⚠️</span>
                  CampusOlx is a trusted, student-only marketplace. Help us keep it safe for everyone—list honestly!
                </div>
                <label className="flex items-start gap-2 mt-2 text-sm text-yellow-900">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 accent-yellow-500"
                    style={{ width: 18, height: 18 }}
                  />
                  I understand and agree not to post fake or misleading listings. If I violate this, my account will be permanently banned and my listings removed.
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 mt-2">
                <Button asChild variant="ghost"><Link href="/home"><ArrowLeft className="mr-2 h-4 w-4"/> Cancel</Link></Button>
                <Button type="submit" disabled={isPending || compressedFiles.length === 0}>
                  {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Listing...</> : 'List Item'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

