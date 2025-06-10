// app/api/chat/route.ts
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

// Le hook attend { message: { role, content, id? } }
export async function POST(req: NextRequest) {
  const { messages } = await req.json()
  const userPrompt = messages.at(-1).content

  const fastapi = await fetch("http://localhost:8000/api/interpret", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dream: userPrompt }),
  })

  if (!fastapi.ok) {
    return NextResponse.json(
      {
        message: {
          id: Date.now().toString(),
          role: "assistant",
          content: "حدث خطأ في الخادم.",
        },
      },
      { status: 500 },
    )
  }

  const { interpretation } = await fastapi.json()

  return NextResponse.json({
    message: {
      id: Date.now().toString(), // génère un id unique
      role: "assistant",
      content: interpretation,
    },
  })
}
