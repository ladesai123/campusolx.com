import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import EditProductForm from "./EditProductFormClient";

export default async function EditProductPage({ params }: { params: { productId: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Fetch the product data from the database.
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", parseInt(params.productId, 10))
    .single();

  // 2. Security check: If no product is found, or if the current user is not the seller,
  // redirect them away to prevent unauthorized edits.
  if (!product || product.seller_id !== user.id) {
    return redirect("/profile");
  }

  // Pass product as prop to client form
  return <EditProductForm product={product} />;
}

