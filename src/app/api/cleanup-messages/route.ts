import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Find duplicate messages that start with "Hi! I'm interested in buying your product"
    const { data: duplicates, error: findError } = await supabase
      .from('messages')
      .select('connection_id, sender_id, content')
      .like('content', 'Hi! I\'m interested in buying your product%');
    
    if (findError) {
      throw findError;
    }
    
    if (!duplicates) {
      return NextResponse.json({ message: 'No messages found', cleaned: 0 });
    }
    
    // Group by connection_id and sender_id to find duplicates
    const groupedMessages = duplicates.reduce((acc, msg) => {
      const key = `${msg.connection_id}-${msg.sender_id}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(msg);
      return acc;
    }, {} as Record<string, any[]>);
    
    let cleanedCount = 0;
    
    // For each group, keep only the first message and delete the rest
    for (const [key, messages] of Object.entries(groupedMessages)) {
      if (messages.length > 1) {
        const [connectionId, senderId] = key.split('-');
        
        // Get all messages for this connection+sender combo (with IDs)
        const { data: fullMessages, error: fullError } = await supabase
          .from('messages')
          .select('id, content, created_at')
          .eq('connection_id', parseInt(connectionId))
          .eq('sender_id', senderId)
          .like('content', 'Hi! I\'m interested in buying your product%')
          .order('created_at', { ascending: true });
        
        if (fullError || !fullMessages || fullMessages.length <= 1) {
          continue;
        }
        
        // Keep the first message, delete the rest
        const messagesToDelete = fullMessages.slice(1).map(m => m.id);
        
        if (messagesToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('messages')
            .delete()
            .in('id', messagesToDelete);
          
          if (!deleteError) {
            cleanedCount += messagesToDelete.length;
          }
        }
      }
    }
    
    return NextResponse.json({ 
      message: `Cleaned up ${cleanedCount} duplicate messages`,
      cleaned: cleanedCount 
    });
    
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ 
      error: 'Failed to cleanup duplicates', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Message cleanup endpoint. Use POST to clean up duplicate "Hi! I\'m interested..." messages' 
  });
}