"use client";

import { Message } from "ai";
import { cn } from "@/lib/utils";
import { User, Bot, Loader2 } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center py-16">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 mb-5 shadow-lg shadow-violet-900/40">
          <Bot className="h-8 w-8 text-white" />
        </div>
        <p className="text-white font-semibold text-lg mb-2">Start a conversation to generate React components</p>
        <p className="text-white/40 text-sm max-w-sm">I can help you create buttons, forms, cards, and more</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-6">
      <div className="space-y-6 max-w-4xl mx-auto w-full">
        {messages.map((message) => (
          <div
            key={message.id || message.content}
            className={cn(
              "flex gap-4",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-900/30 flex items-center justify-center">
                  <Bot className="h-4.5 w-4.5 text-white" />
                </div>
              </div>
            )}

            <div className={cn(
              "flex flex-col gap-2 max-w-[85%]",
              message.role === "user" ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "rounded-xl px-4 py-3",
                message.role === "user"
                  ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/30"
                  : "bg-white/8 text-white border border-white/10 shadow-sm backdrop-blur-sm"
              )}>
                <div className="text-sm">
                  {message.parts ? (
                    <>
                      {message.parts.map((part, partIndex) => {
                        switch (part.type) {
                          case "text":
                            return message.role === "user" ? (
                              <span key={partIndex} className="whitespace-pre-wrap">{part.text}</span>
                            ) : (
                              <MarkdownRenderer
                                key={partIndex}
                                content={part.text}
                                className="prose-sm"
                              />
                            );
                          case "reasoning":
                            return (
                              <div key={partIndex} className="mt-3 p-3 bg-white/5 rounded-md border border-white/10">
                                <span className="text-xs font-medium text-white/50 block mb-1">Reasoning</span>
                                <span className="text-sm text-white/70">{part.reasoning}</span>
                              </div>
                            );
                          case "tool-invocation":
                            const tool = part.toolInvocation;
                            const toolLabels: Record<string, { pending: string; done: string }> = {
                              str_replace_editor: { pending: "Writing code…", done: "Code written" },
                              file_manager: { pending: "Managing files…", done: "Files updated" },
                            };
                            const label = toolLabels[tool.toolName] ?? { pending: "Working…", done: "Done" };
                            const isDone = tool.state === "result" && tool.result;
                            return (
                              <div key={partIndex} className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-white/5 rounded-lg text-xs border border-white/10">
                                {isDone ? (
                                  <>
                                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                    <span className="text-white/70">{label.done}</span>
                                  </>
                                ) : (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin text-violet-400" />
                                    <span className="text-white/70">{label.pending}</span>
                                  </>
                                )}
                              </div>
                            );
                          case "source":
                            return (
                              <div key={partIndex} className="mt-2 text-xs text-white/40">
                                Source: {JSON.stringify(part.source)}
                              </div>
                            );
                          case "step-start":
                            return partIndex > 0 ? <hr key={partIndex} className="my-3 border-white/10" /> : null;
                          default:
                            return null;
                        }
                      })}
                      {isLoading &&
                        message.role === "assistant" &&
                        messages.indexOf(message) === messages.length - 1 && (
                          <div className="flex items-center gap-2 mt-3 text-white/40">
                            <Loader2 className="h-3 w-3 animate-spin text-violet-400" />
                            <span className="text-sm">Generating...</span>
                          </div>
                        )}
                    </>
                  ) : message.content ? (
                    message.role === "user" ? (
                      <span className="whitespace-pre-wrap">{message.content}</span>
                    ) : (
                      <MarkdownRenderer content={message.content} className="prose-sm" />
                    )
                  ) : isLoading &&
                    message.role === "assistant" &&
                    messages.indexOf(message) === messages.length - 1 ? (
                    <div className="flex items-center gap-2 text-white/40">
                      <Loader2 className="h-3 w-3 animate-spin text-violet-400" />
                      <span className="text-sm">Generating...</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            
            {message.role === "user" && (
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-900/30 flex items-center justify-center">
                  <User className="h-4.5 w-4.5 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}