"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, User, Send, Loader2, ChevronDown, Settings, Trash2, Menu, X, Sparkles, History, Cpu, Sun, Moon } from "lucide-react";

import Markdown from "@/components/markdown";

interface Message {
  role: 'assistant' | 'user';
  content: string;
  id: string;
  timestamp: Date;
}

const ThemeToggle = ({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onToggle}
    className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
  >
    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
  </Button>
);

const MessageBubble = ({ message }: { message: Message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-3 ${isAssistant ? 'flex-row' : 'flex-row-reverse'} group`}>
      <div className={`h-8 w-8 rounded-full flex items-center justify-center
        ${isAssistant ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
        {isAssistant ? (
          <Bot className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        ) : (
          <User className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
        )}
      </div>
      <div className="flex flex-col gap-1 max-w-[80%]">
        <Markdown message={message} />
      </div>
    </div>
  );
};

const Sidebar = ({ isOpen, onClose, isDark, onToggleTheme }: {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleTheme: () => void
}) => {
  const menuItems = [
    { icon: Sparkles, label: 'New Chat', onClick: () => console.log('New Chat') },
    { icon: History, label: 'History', onClick: () => console.log('History') },
    { icon: Cpu, label: 'AI Models', onClick: () => console.log('AI Models') },
    { icon: Settings, label: 'Settings', onClick: () => console.log('Settings') },
  ];

  return (
    <Card className={`h-full shadow-lg flex flex-col ${isOpen ? 'block' : 'hidden'} lg:block
      dark:bg-gray-800 dark:border-gray-700`}>
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-blue-500 dark:text-blue-400 flex items-center gap-2">
          <Bot />
          AI Chat
        </h2>
        <div className="flex gap-2">
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-gray-500 dark:text-gray-400"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <CardContent className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 
                hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
            >
              <item.icon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </CardContent>

      <div className="p-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <User className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">User Account</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">user@example.com</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

const ChatArea = ({
  messages,
  isLoading,
  messagesEndRef,
  handleScroll,
  showScrollButton,
  scrollToBottom
}: {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  showScrollButton: boolean;
  scrollToBottom: () => void;
}) => {
  return (
    <div
      className="flex-1 overflow-y-auto space-y-6 pr-4 scroll-smooth h-full"
      onScroll={handleScroll}
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 space-y-4">
          <Bot className="h-12 w-12 text-blue-200 dark:text-blue-900/30" />
          <p className="text-center">Start a conversation with the AI Assistant</p>
        </div>
      ) : (
        messages.map((message: Message) => (
          <MessageBubble key={message.id} message={message} />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

const AIChatbox = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight;
    setShowScrollButton(!bottom);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const clearChat = () => {
    setMessages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        id: (Date.now() + 1).toString(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';

      if (!reader) {
        throw new Error('No reader available');
      }

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // Decode the stream chunk and append to the message
          const chunk = decoder.decode(value);
          try {
            // Parse each line as a separate JSON object
            const lines = chunk.split('\n').filter(line => line.trim());
            for (const line of lines) {
              const parsed = JSON.parse(line);
              if (parsed.response) {
                streamedContent += parsed.response;
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: streamedContent }
                      : msg
                  )
                );
              }
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 
    dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6 transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto h-[calc(100vh-3rem)] flex gap-6">
        {/* Sidebar Card */}
        <div className="w-80 hidden lg:block">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isDark={isDarkMode}
            onToggleTheme={toggleDarkMode}
          />
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          {isSidebarOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsSidebarOpen(false)}>
              <div className="absolute left-0 top-0 w-80 h-full">
                <Sidebar
                  isOpen={isSidebarOpen}
                  onClose={() => setIsSidebarOpen(false)}
                  isDark={isDarkMode}
                  onToggleTheme={toggleDarkMode}
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Chat Card */}
        <Card className="flex-1 flex flex-col shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-100 dark:border-gray-700 
          rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-500 dark:text-gray-400"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                <Bot className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                AI Assistant
              </h2>
            </div>
            <div className="flex gap-2">
              <ThemeToggle isDark={isDarkMode} onToggle={toggleDarkMode} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <CardContent className="flex-1 flex flex-col p-6 gap-4 h-[calc(100vh-12rem)] overflow-hidden">
            {showSettings && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-2 animate-fadeIn">
                <h3 className="font-medium text-blue-700 dark:text-blue-300">Chat Settings</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">Additional settings and configurations can go here</p>
              </div>
            )}

            <div className="flex-1 flex flex-col min-h-0">
              <ChatArea
                messages={messages}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef}
                handleScroll={handleScroll}
                showScrollButton={showScrollButton}
                scrollToBottom={scrollToBottom}
              />
            </div>

            {/* Input form */}
            <div className="relative">
              {showScrollButton && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-28 right-8 rounded-full shadow-lg hover:shadow-xl 
                    transition-all duration-300 border-blue-100 hover:border-blue-200
                    dark:border-blue-900/20 dark:hover:border-blue-800"
                  onClick={scrollToBottom}
                >
                  <ChevronDown className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                </Button>
              )}
              <form onSubmit={handleSubmit} className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full pr-12 py-3 rounded-xl bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent min-h-[5rem]"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 h-auto"
                  variant="ghost"
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500 dark:text-blue-400" />
                  ) : (
                    <Send className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIChatbox;