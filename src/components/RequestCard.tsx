import React from 'react';
import { Eye, Handshake } from 'lucide-react';
import type { RequestWithProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RequestCardProps {
  request: RequestWithProfile;
  currentUserId?: string;
  compact?: boolean;
}

export function RequestCard({ request, currentUserId, compact = false }: RequestCardProps) {
  const isOwner = currentUserId === request.user_id;

  const whatsappUrl = request.whatsapp_number
    ? `https://wa.me/91${request.whatsapp_number}?text=${encodeURIComponent(
        `Hi! I saw your "Looking For: ${request.title}" on CampusOlx. I have this and want to sell it to you!`
      )}`
    : null;

  return (
    <div className={`bg-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full ${compact ? 'p-3' : 'p-4'}`}>
      <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full pointer-events-none" />
      
      <div className={`flex justify-between items-start ${compact ? 'mb-1.5' : 'mb-2'} relative z-10`}>
        <span className={`font-bold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-md ${compact ? 'text-[8px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1'}`}>
          Wanted
        </span>
        <div className={`flex items-center gap-1 text-gray-400 ${compact ? 'text-[9px]' : 'text-[11px]'}`}>
          <Eye className={compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
          {request.view_count || 0}
        </div>
      </div>

      <h3 className={`font-bold text-gray-900 leading-tight flex-grow relative z-10 ${compact ? 'text-sm mb-1 line-clamp-2' : 'text-lg mb-2'}`}>
        {request.title}
      </h3>

      <div className={`flex items-center gap-2 relative z-10 ${compact ? 'mb-2' : 'mb-4'}`}>
        <span className={`font-semibold text-gray-700 bg-gray-100 rounded ${compact ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'}`}>
          {request.max_budget ? `Up to ₹${request.max_budget.toLocaleString()}` : 'Flexible'}
        </span>
      </div>

      <div className={`flex items-center gap-1.5 mt-auto border-t relative z-10 ${compact ? 'pt-2' : 'pt-3 gap-2'}`}>
        <Avatar className={compact ? 'h-5 w-5' : 'h-6 w-6'}>
          <AvatarImage src={request.profiles?.profile_picture_url || ""} />
          <AvatarFallback className={compact ? 'text-[8px]' : 'text-[10px]'}>
            {request.profiles?.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <span className={`text-gray-500 truncate flex-grow ${compact ? 'text-[10px]' : 'text-xs'}`}>
          {request.profiles?.name?.split(' ')[0] || "Student"}
        </span>

        {!isOwner && whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors shrink-0 ${compact ? 'gap-1 text-[9px] px-2 py-1' : 'gap-1.5 text-xs px-3 py-1.5'}`}
          >
            <Handshake className={compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
            I have this
          </a>
        ) : isOwner ? (
          <span className={`text-gray-400 font-medium border rounded-full ${compact ? 'text-[8px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1'}`}>Your post</span>
        ) : (
          <span className={`text-gray-400 ${compact ? 'text-[8px]' : 'text-[10px]'}`}>No info</span>
        )}
      </div>
    </div>
  );
}
