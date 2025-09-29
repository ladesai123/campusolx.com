import { NextResponse } from 'next/server';

// --- THIS IS THE FIX ---
// Use the most compatible model for v1beta and image input
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`;

export async function POST(request: Request) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json({ message: 'No image data provided.' }, { status: 400 });
    }

    const prompt = `
      Based on this image of an item being sold on a campus marketplace, generate a concise, catchy title, a friendly, informative description, and suggest a category.
      - The title should be no more than 5 words.
      - The description should be 3-4 sentences, highlighting key features a student would care about.
      - The category MUST be one of the following exact values: "Electronics", "Books & Notes", "Hostel & Room Essentials", "Mobility", "Fashion & Accessories", "Lab & Academics", "Hobbies & Sports", "Other".
      - Format the response as a valid JSON object with three keys: "title", "description", and "category".
    `;

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageData,
              },
            },
          ],
        },
      ],
    };

    const res = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      console.error('Gemini API Error:', JSON.stringify(errorDetails, null, 2));
      throw new Error('The AI generator failed to process the image.');
    }

    const data = await res.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
        console.error("Unexpected response structure from Gemini:", JSON.stringify(data, null, 2));
        throw new Error("The AI returned an unexpected response format.");
    }
    
    const text = data.candidates[0].content.parts[0].text;
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const generatedContent = JSON.parse(jsonString);

    return NextResponse.json(generatedContent);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('Error in generate-description route:', errorMessage);
    return NextResponse.json(
      { message: 'The AI generator is a bit busy right now. Please try again in a moment.' },
      { status: 500 }
    );
  }
}

