import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, Plus, Loader2, ArrowRight } from 'lucide-react';
import { Product, CartItem } from '../types';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
  onOpenMealPlanner: () => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  suggestedProducts?: Product[];
  quickActions?: string[];
  time: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onAddToCart,
  onOpenMealPlanner
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "👋 Hey there! I'm Chef Quicky, your AI grocery & cooking concierge. Ask me for quick recipe ideas, healthy swaps, or missing ingredients for tonight's dinner!",
      quickActions: ["Quick 10-min dinner", "High protein snacks", "Healthy alternatives for soda"],
      time: 'Just now'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (userText?: string) => {
    const textToSend = userText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!userText) setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          cartItems
        })
      });
      const data = await res.json();

      const aiReply: Message = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: data.reply || "Here are some great options ready for 10-minute dispatch:",
        suggestedProducts: data.suggestedProducts,
        quickActions: data.quickActions,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiReply]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'ai',
          text: "I'm right here! Feel free to ask me for any quick recipe ideas or pantry essentials.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/60 backdrop-blur-xs animate-in fade-in flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 bg-gradient-to-r from-rose-600 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base">Chef Quicky</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              </div>
              <p className="text-[11px] text-rose-100 font-medium">QuickMart AI Assistant • Gemini 3.6</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recipe Shortcut Banner */}
        <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Need a full meal plan?</span>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenMealPlanner();
            }}
            className="text-[11px] font-black text-rose-600 hover:text-rose-700 bg-white px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs cursor-pointer flex items-center gap-1"
          >
            Open Recipe Planner <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end gap-2 max-w-[85%]">
                {msg.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 mb-1 text-[11px] font-bold">
                    Q
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-rose-600 text-white rounded-br-xs shadow-md shadow-rose-600/20'
                      : 'bg-white text-zinc-900 border border-zinc-200/80 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 px-1">{msg.time}</span>

              {/* Product recommendations */}
              {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                <div className="mt-2 w-full space-y-1.5 pl-8">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Suggested Items:</span>
                  {msg.suggestedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-2 bg-white rounded-xl border border-zinc-200 flex items-center justify-between shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{p.image}</span>
                        <div>
                          <p className="text-xs font-bold text-zinc-900 leading-tight">{p.name}</p>
                          <span className="text-[10px] text-zinc-500">₹{p.price} • {p.unit}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onAddToCart(p)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 border border-rose-200"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Actions Chips */}
              {msg.quickActions && msg.quickActions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 pl-8">
                  {msg.quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(action)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-rose-50 border border-zinc-200 hover:border-rose-300 text-zinc-700 hover:text-rose-600 font-medium transition-colors text-left shadow-2xs"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-zinc-500 text-xs pl-8">
              <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
              <span>Chef Quicky is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-zinc-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Chef Quicky anything..."
              className="flex-1 px-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-2xl text-xs sm:text-sm font-medium text-zinc-900 focus:outline-none focus:border-rose-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="w-10 h-10 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0 shadow-md shadow-rose-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
