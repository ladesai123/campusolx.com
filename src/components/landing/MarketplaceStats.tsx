"use client";

export default function MarketplaceStats() {
  return (
    <div className="flex flex-row items-center justify-start gap-8 mt-4 overflow-x-auto pb-4 sm:pb-0 hide-scrollbar">
      <div className="flex flex-col items-start pr-8 border-r border-[#E2E8F0]">
        <div className="text-[36px] font-[700] text-[#0F172A] leading-tight title-font">199</div>
        <div className="text-[13px] font-[500] text-[#64748B] whitespace-nowrap">Items Sold</div>
      </div>
      <div className="flex flex-col items-start pr-8 border-r border-[#E2E8F0]">
        <div className="text-[36px] font-[700] text-[#0F172A] leading-tight title-font">107</div>
        <div className="text-[13px] font-[500] text-[#64748B] whitespace-nowrap">Active Sellers</div>
      </div>
      <div className="flex flex-col items-start">
        <div className="text-[36px] font-[700] text-[#0F172A] leading-tight title-font">2d</div>
        <div className="text-[13px] font-[500] text-[#64748B] whitespace-nowrap">Avg. Deal Time</div>
      </div>
    </div>
  );
}