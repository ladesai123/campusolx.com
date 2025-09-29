"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { Database } from "@/lib/database.types";

type Product = {
  id: number;
  seller_id: string;
  title: string;
  description?: string | null;
  price?: number | null;
  category?: string | null;
  image_urls?: string[] | null;
  created_at?: string | null;
  mrp?: number | null;
  status?: string | null;
  available_from?: string | null;
  show_on_landing?: boolean | null;
  is_hidden?: boolean | null;
};

export default function ProductTable() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [hidingId, setHidingId] = useState<number | null>(null);
  const [hideError, setHideError] = useState<string | null>(null);
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("id,seller_id,title,description,price,category,image_urls,created_at,mrp,status,available_from,show_on_landing,is_hidden")
        .order("created_at", { ascending: false });
      if (error) {
        setError(error.message);
        setProducts(null);
      } else {
        setProducts(data as any);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Toggle is_hidden handler
  const handleToggleHidden = async (id: number, current: boolean) => {
    setHidingId(id);
    setHideError(null);
    // Optimistically update UI
    const prevProducts = products;
    setProducts(
      products
        ? products.map((p) =>
            p.id === id ? { ...p, is_hidden: !current } : p
          )
        : null
    );
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .update({ is_hidden: !current } as any)
      .eq("id", id);
    if (error) {
      setHideError(error.message);
      setProducts(prevProducts);
    }
    setHidingId(null);
  };

  if (loading) return <div className="py-8 text-blue-600">Loading products...</div>;
  if (error) return <div className="py-8 text-red-600">Error: {error}</div>;
  if (!products || products.length === 0) return <div className="py-8 text-slate-500">No products found.</div>;

  // Delete handler
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product? This cannot be undone.")) return;
    setDeletingId(id);
    setDeleteError(null);
    // Optimistically remove from UI
    const prevProducts = products;
    setProducts(products ? products.filter((p) => p.id !== id) : null);
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      setDeleteError(error.message);
      // Rollback UI
      setProducts(prevProducts);
    }
    setDeletingId(null);
  };

  // Toggle show_on_landing handler
  const handleToggleLanding = async (id: number, current: boolean) => {
    setTogglingId(id);
    setToggleError(null);
    // Optimistically update UI
    const prevProducts = products;
    setProducts(
      products
        ? products.map((p) =>
            p.id === id ? { ...p, show_on_landing: !current } : p
          )
        : null
    );
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .update({ show_on_landing: !current } as any)
      .eq("id", id);
    if (error) {
      setToggleError(error.message);
      setProducts(prevProducts);
    }
    setTogglingId(null);
  };

  return (
    <div className="overflow-x-auto">
  {deleteError && <div className="mb-2 text-red-600">Delete failed: {deleteError}</div>}
  {toggleError && <div className="mb-2 text-red-600">Toggle failed: {toggleError}</div>}
  {hideError && <div className="mb-2 text-red-600">Hide/unhide failed: {hideError}</div>}
  <table className="min-w-full border text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 border">Image</th>
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">MRP</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Show on Landing</th>
            <th className="p-2 border">Hidden?</th>
            <th className="p-2 border">Created At</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className={`hover:bg-slate-50${product.is_hidden ? ' bg-red-100 text-red-700' : ''}`}
            >
              <td className="p-2 border">
                {product.image_urls && product.image_urls.length > 0 && product.image_urls[0] ? (
                  <Image src={product.image_urls[0]} alt={product.title} width={48} height={48} className="rounded object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-400">No Image</div>
                )}
              </td>
              <td className="p-2 border max-w-xs truncate">{product.title}</td>
              <td className="p-2 border">₹{product.price}</td>
              <td className="p-2 border">₹{product.mrp}</td>
              <td className="p-2 border">
                <span className={
                  product.status === "approved"
                    ? "bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                    : product.status === "pending"
                    ? "bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs"
                    : "bg-red-100 text-red-700 px-2 py-1 rounded text-xs"
                }>
                  {product.status}
                </span>
              </td>
              <td className="p-2 border text-center">
                {typeof product.show_on_landing === "boolean" ? (
                  <Button
                    size="sm"
                    className={
                      product.show_on_landing
                        ? "bg-green-600 hover:bg-green-700 text-white border-green-700"
                        : ""
                    }
                    variant={product.show_on_landing ? "default" : "outline"}
                    disabled={togglingId === product.id}
                    onClick={() => handleToggleLanding(product.id, !!product.show_on_landing)}
                  >
                    {togglingId === product.id
                      ? "Updating..."
                      : product.show_on_landing
                        ? "Featured"
                        : "Not Featured"}
                  </Button>
                ) : (
                  <span className="text-slate-400">N/A</span>
                )}
              </td>
              <td className="p-2 border text-center">
                {typeof product.is_hidden === "boolean" ? (
                  <Button
                    size="sm"
                    className={
                      product.is_hidden
                        ? "bg-red-600 hover:bg-red-700 text-white border-red-700"
                        : ""
                    }
                    variant={product.is_hidden ? "default" : "outline"}
                    disabled={hidingId === product.id}
                    onClick={() => handleToggleHidden(product.id, !!product.is_hidden)}
                  >
                    {hidingId === product.id
                      ? "Updating..."
                      : product.is_hidden
                        ? "Hidden"
                        : "Visible"}
                  </Button>
                ) : (
                  <span className="text-slate-400">N/A</span>
                )}
              </td>
              <td className="p-2 border text-xs">{product.created_at ? new Date(product.created_at).toLocaleString() : "N/A"}</td>
              <td className="p-2 border">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deletingId === product.id}
                  onClick={() => handleDelete(product.id)}
                >
                  {deletingId === product.id ? "Deleting..." : "Delete"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
