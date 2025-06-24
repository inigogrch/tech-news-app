'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

// Simple function to parse bold markdown
const parseMarkdown = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={index} className="font-bold">{boldText}</strong>;
    }
    return part;
  });
};

export default function AgentPage() {
  const { messages, input, setInput, append, isLoading } = useChat({
    api: '/api/agent',
    maxSteps: 5,
  });

  const [suggestions] = useState([
    "What are the latest AI breakthroughs?",
    "Show me trending tech topics",
    "Analyze the sentiment of recent tech news",
    "Search for Apple news",
    "What's happening in the startup world?"
  ]);

  const handleSuggestionClick = (suggestion: string) => {
    append({ content: suggestion, role: 'user' });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border p-4">
        <h1 className="text-xl font-semibold text-foreground">Tech News Agent</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered assistant with tools for tech news search, trending topics, and sentiment analysis
        </p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            <p className="mb-4">Start a conversation with the AI agent below.</p>
            <p className="text-xs mb-6">
              The agent can search tech news, get trending topics, and analyze sentiment!
            </p>
            
            {/* Suggestion buttons */}
            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-sm font-medium">Try these suggestions:</p>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isLoading}
                  className="block w-full px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="space-y-2">
              <div
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className="max-w-md lg:max-w-2xl">
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {parseMarkdown(message.content)}
                    </div>
                    
                    {/* Display tool invocations if present */}
                    {message.toolInvocations && message.toolInvocations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/20">
                        <p className="text-xs text-muted-foreground/70 mb-2">Tools used:</p>
                        {message.toolInvocations.map((tool, toolIndex) => (
                          <div key={toolIndex} className="text-xs bg-background/50 rounded px-2 py-1 mb-1">
                            <span className="font-mono">{tool.toolName}</span>
                            {tool.args && (
                              <span className="ml-2 text-muted-foreground/70">
                                {JSON.stringify(tool.args)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted max-w-md lg:max-w-2xl px-4 py-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                  <div className="relative flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <span className="text-primary text-sm animate-pulse">🤖</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Agent is thinking and using tools...
                    </span>
                    <div className="flex gap-0.5">
                      <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></span>
                    </div>
                  </div>
                  <div className="mt-2 h-1 bg-muted-foreground/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/50 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim() || isLoading) return;
          append({ content: input, role: 'user' });
          setInput('');
        }}
        className="border-t border-border p-4"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the agent about tech news..."
            className="flex-1 px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
