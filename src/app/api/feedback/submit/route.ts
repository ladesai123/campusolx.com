import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

// POST /api/feedback/submit
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'You must be logged in to submit feedback.' }, { status: 401 });
    }

    const { name, year, experience, consent } = await req.json();

    if (!name || !year || !experience || consent !== true) {
      return NextResponse.json({ error: 'All fields are required and consent must be given.' }, { status: 400 });
    }

    // Insert feedback with status 'pending' for admin approval
  const { error: insertError } = await supabase.from('feedback').insert({
      user_id: user.id,
      year,
      experience,
      consent,
      status: 'pending',
      name,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
