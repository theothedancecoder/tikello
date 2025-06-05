"use client";

import React, { useState, useEffect, useRef } from "react";

type Role = "user" | "assistant" | "system";

interface Message {
  role: Role;
  content: string;
}

interface AIChatProps {
  mode: "buyer" | "seller";
}

export default function AIChat({ mode }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const systemPrompt =
    mode === "buyer"
      ? "You are an AI assistant helping users to buy tickets. Guide them through the process and answer their questions clearly and politely."
      : "You are an AI assistant helping event sellers to offer events for sale. Guide them through the process and answer their questions clearly and politely.";

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...newMessages,
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      const assistantMessage = data.message;

      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes wave {
            0% { transform: rotate(0deg); }
            15% { transform: rotate(14deg); }
            30% { transform: rotate(-8deg); }
            40% { transform: rotate(14deg); }
            50% { transform: rotate(-4deg); }
            60% { transform: rotate(10deg); }
            70% { transform: rotate(0deg); }
            100% { transform: rotate(0deg); }
          }
          .animate-wave {
            display: inline-block;
            transform-origin: 70% 70%;
            animation-name: wave;
            animation-duration: 2s;
            animation-iteration-count: infinite;
          }
        `}
      </style>
      <div className="fixed bottom-4 right-4 w-80 max-h-[400px] bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col">
        <div className="p-2 border-b border-gray-200 font-semibold flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {mode === "buyer" ? "Tikello" : "Seller Assistant"}
            {(mode === "seller" || mode === "buyer") && (
              <span
                className="animate-wave"
                role="img"
                aria-label="waving smiling face"
              >
                👋😊
              </span>
            )}
          </div>
          {mode === "buyer" && (
            <div className="text-sm text-gray-600 italic">
              How can I help?
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded ${
                msg.role === "user" ? "bg-blue-100 text-blue-900 self-end" : "bg-gray-100 text-gray-900 self-start"
              } max-w-[75%]`}
            >
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-2 border-t border-gray-200 flex gap-2">
          <textarea
            className="flex-grow border border-gray-300 rounded px-2 py-1 resize-none"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
