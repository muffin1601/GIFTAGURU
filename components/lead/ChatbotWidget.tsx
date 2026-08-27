"use client";

import Link from "next/link";
import { Bot, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import LeadForm from "@/components/forms/LeadForm";
import { chatbotSuggestions, getChatbotResponse } from "@/lib/chatbot/knowledge";

type Message = {
  from: "bot" | "user";
  text: string;
  actions?: { label: string; href: string }[];
  needsLead?: boolean;
};

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Hi! Welcome to Gifta Guru. I can help you find the right corporate gifts." },
  ]);

  function choose(input: string) {
    const response = getChatbotResponse(input);
    setMessages((current) => [
      ...current,
      { from: "user", text: input },
      { from: "bot", text: response.answer, actions: response.actions, needsLead: response.needsLead },
    ]);
  }

  return (
    <>
      {open ? (
        <div className="max-h-[72vh] w-[320px] overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-navy-950/10 sm:w-[360px]">
          <div className="flex items-center justify-between bg-navy-950 px-4 py-3 text-cream-100">
            <span className="inline-flex items-center gap-2 text-sm font-semibold"><Bot className="h-4 w-4" /> Gift advisor</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chatbot" className="rounded-full p-1 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-[46vh] space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={`${message.from}-${index}`} className={`rounded-lg p-3 text-sm ${message.from === "bot" ? "bg-cream-100 text-ink-800" : "ml-auto bg-gold-500 text-navy-950"}`}>
                <p>{message.text}</p>
                {message.actions?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.actions.map((action) => (
                      <Link key={action.label} href={action.href} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-navy-950 ring-1 ring-navy-950/10">
                        {action.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
                {message.needsLead ? (
                  <div className="mt-3 rounded-lg bg-white p-3">
                    <p className="mb-3 text-xs font-semibold text-navy-950">Would you like our gifting team to contact you?</p>
                    <LeadForm type="chatbot" source="Chatbot" compact />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="border-t border-navy-950/10 p-3">
            <div className="flex flex-wrap gap-2">
              {chatbotSuggestions.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => choose(suggestion)} className="rounded-full border border-navy-950/10 px-3 py-1.5 text-xs font-semibold text-navy-950 hover:bg-cream-100">
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-navy-950 text-cream-100 shadow-md shadow-navy-950/15 transition-transform hover:-translate-y-0.5 hover:bg-navy-800"
        aria-label="Open gift advisor chatbot"
        aria-expanded={open}
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    </>
  );
}
