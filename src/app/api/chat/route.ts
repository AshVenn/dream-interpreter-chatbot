import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    // The last user message is the new prompt:
    const userMessage = messages[messages.length - 1].content as string

    // Call the Python FastAPI backend:
    const res = await fetch("http://localhost:8000/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dream: userMessage }),
    })

    if (!res.ok) {
      throw new Error(`Python server returned an error: ${res.status} ${res.statusText}`)
    }

    // The response includes { interpretation, sources }
    const data = await res.json()

    // Return the assistant response to the chat UI
    // shape: { role: "assistant", content: string }
    return NextResponse.json({
      role: "assistant",
      content: data.interpretation,
    })
  } catch (error: any) {
    console.error("Error in /api/chat route:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
