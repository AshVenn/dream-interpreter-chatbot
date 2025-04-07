"use client";

import { useChat } from "ai/react";
import { Chat } from "@/components/ui/chat";

export default function Page() {
  // Configure the useChat hook to point to your API endpoint.
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, append } =
    useChat({
      endpoint: "/api/chat", // Your Next.js API route that forwards to your backend
    });

  return (
    <div className="container mx-auto max-w-md py-10">
      <h1 className="text-2xl font-bold text-center mb-4">
        Islamic Dream Interpreter Chat
      </h1>
      <Chat
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isGenerating={isLoading}
        stop={stop}
        append={append}
        suggestions={[
          "I dreamed of flying over a desert",
          "I saw a snake in my dream—what does it mean?",
          "I was lost in a labyrinth; please help interpret it",
        ]}
      />
    </div>
  );
}
