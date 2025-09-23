"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface CategoryFilterProps {
  categoryCounts: { [key: string]: number };
}

const allCategories = [
  "Electronics",
  "Books & Notes",
  "Hostel & Room Essentials",
  "Mobility",
  "Fashion & Accessories",
  "Lab & Academics",
  "Hobbies & Sports",
  "Other",
];

export default function CategoryFilter({ categoryCounts }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedCategories = searchParams.getAll('category');

  const handleCheckboxChange = (category: string) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    const allSelected = currentParams.getAll('category');

    if (allSelected.includes(category)) {
      // If it's already selected, unselect it
      const newSelection = allSelected.filter(c => c !== category);
      currentParams.delete('category');
      newSelection.forEach(c => currentParams.append('category', c));
    } else {
      // If it's not selected, select it
      currentParams.append('category', category);
    }
    
    const newQuery = currentParams.toString();
    router.push(`${pathname}?${newQuery}`, { scroll: false });
  };

  const clearFilters = () => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.delete('category');
    const newQuery = currentParams.toString();
    router.push(`${pathname}?${newQuery}`, { scroll: false });
  };

  const totalProducts = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="p-4 bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Filter by Category
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Select Categories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuCheckboxItem
              checked={selectedCategories.length === 0}
              onCheckedChange={clearFilters}
            >
              <span className="flex-grow">All Categories</span>
              <span className="text-xs text-gray-500">{totalProducts}</span>
            </DropdownMenuCheckboxItem>

            {allCategories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCheckboxChange(category)}
              >
                <span className="flex-grow">{category}</span>
                <span className="text-xs text-gray-500">{categoryCounts[category] || 0}</span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {selectedCategories.length > 0 && (
           <Button variant="ghost" onClick={clearFilters}>Clear Filters</Button>
        )}
      </div>
    </div>
  );
}
