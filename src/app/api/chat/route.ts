import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const SYSTEM_PROMPT = `
You are the "Nara Kofun Transport Guide" assistant.
You must strictly follow these rules:
1. ONLY answer questions related to:
   - Transportation to Kofuns in Nara (Trains, Buses, Routes)
   - Buying tickets (JR, Kintetsu, Subway)
   - Station facilities (Lockers, Directions)
   - Kofun locations and basic details
2. If a user asks about ANYTHING else (e.g., "Write me code", "What is 2+2?", "Tell me a joke", "Weather in Tokyo", "Poetry"), you MUST refuse gently.
   - Example refusal: "I'm sorry, I can only help you with transportation to Kofuns in Nara."
3. Keep answers concise and helpful for a tourist.
`;

export async function POST(req: Request) {
  try {
    const { messages, locale, clientTime } = await req.json();

    // clientTime is now sent as "HH:MM" (e.g., "18:55") from the client
    const timeString = clientTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Stricter prompt engineering for Japanese to avoid hallucinations
    const languageInstruction = locale === 'ja'
      ? `
IMPORTANT INSTRUCTIONS FOR JAPANESE MODE:
1. Language: You MUST answer in natural, polite Japanese (Desu/Masu form - 丁寧語).
2. Identity: You are the "Nara Kofun Transport Guide" (奈良古墳交通ガイド). Do NOT invent other names.
3. Current User Location Time: ${timeString}.
   - If morning (05:00-10:59): Use "おはようございます".
   - If day (11:00-17:59): Use "こんにちは".
   - If evening/night (18:00-04:59): Use "こんばんは".
4. For simple greetings like "Hi" or "Hello":
   - Greet based on time.
   - Say something like "奈良の古墳へのアクセスについて、何かお手伝いできることはありますか？" (How can I help you with transport to Nara Kofuns?).
5. Keep it concise.
`
      : `\nIMPORTANT: You must answer in English. Current User Time: ${timeString}. Greetings must match this time.`;

    // Add system prompt
    const completion = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + languageInstruction },
        ...messages,
      ],
    });

    const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request.";

    // Return in the structure expected by ChatWindow.tsx (mimicking Dialogflow)
    const jsonResponse = [
      {
        queryResult: {
          fulfillmentMessages: [
            {
              message: "text",
              text: { text: [aiResponse] }
            }
          ]
        }
      }
    ];

    return NextResponse.json(jsonResponse);

  } catch (error: any) {
    console.error("Error in chat API:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}