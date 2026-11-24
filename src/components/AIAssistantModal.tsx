import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Mic, MicOff, Trash2, X, Sparkles, ExternalLink, AlertCircle } from 'lucide-react';
import { AIChatMessage } from '../types/ai';
import { AIService } from '../ai/aiService';
import { SpeechService } from '../voice/speechService';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageContext: string;
  pageTitle: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  pageContext,
  pageTitle,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `Hello! I'm your accessibility browsing copilot. I understand this page ("${pageTitle || 'Current Page'}"). Ask me anything about the content, forms, deadlines, or requirements!`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: AIChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      content: textToSend.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await AIService.answerPageQuestion(
        textToSend,
        pageContext,
        messages
      );

      const assistantMsg: AIChatMessage = {
        id: 'assistant_' + Date.now(),
        sender: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: AIChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : String(err)}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (isRecording) {
      SpeechService.stopListening();
      setIsRecording(false);
    } else {
      setVoiceError(null);
      SpeechService.startListening(
        (transcript) => {
          setInput(transcript);
          handleSend(transcript);
        },
        (recording) => setIsRecording(recording),
        (err) => setVoiceError(err)
      );
    }
  };

  const handleSpeak = (text: string) => {
    if (SpeechService.isSpeaking()) {
      SpeechService.stop();
    } else {
      SpeechService.speak(text);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        sender: 'assistant',
        content: `Chat history cleared. How else can I assist you with "${pageTitle}"?`,
        timestamp: Date.now(),
      },
    ]);
  };

  const suggestions = [
    'Explain this page simply.',
    'What are the key deadlines?',
    'What documents are required?',
    'Where is the application form?',
  ];

  return (
    <div
      role="dialog"
      aria-label="AI Webpage Assistant"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div className="bg-navy-900 border border-navy-700 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col h-[600px] max-h-[90vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 bg-navy-800 border-b border-navy-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-aqua-500/20 text-aqua-400 flex items-center justify-center border border-aqua-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-white">AI Webpage Assistant</h3>
                <span className="text-[10px] font-bold uppercase bg-aqua-600/30 text-aqua-300 px-2 py-0.5 rounded-full border border-aqua-500/20">
                  Context-Aware
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs">{pageTitle || 'Analyzing current page'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              title="Clear Chat"
              className="p-2 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-navy-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-navy-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 bg-navy-800/50 border-b border-navy-800 flex gap-2 overflow-x-auto text-xs">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              className="shrink-0 bg-navy-700/80 hover:bg-navy-600 text-slate-200 px-3 py-1.5 rounded-full border border-navy-600 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-aqua-400" />
              {s}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-aqua-600 text-white rounded-br-none'
                    : 'bg-navy-800 text-slate-100 border border-navy-700 rounded-bl-none shadow-sm'
                }`}
              >
                {m.content}
              </div>
              {m.sender === 'assistant' && (
                <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-slate-400">
                  <button
                    onClick={() => handleSpeak(m.content)}
                    className="hover:text-aqua-400 flex items-center gap-1 transition-colors"
                  >
                    🔊 Read aloud
                  </button>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-aqua-400 bg-navy-800 border border-navy-700 rounded-2xl px-4 py-3 w-fit">
              <div className="w-2 h-2 rounded-full bg-aqua-400 animate-ping" />
              Analyzing webpage context...
            </div>
          )}

          {voiceError && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 rounded-xl p-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {voiceError}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-navy-800 border-t border-navy-700">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleMic}
              title={isRecording ? 'Stop Voice Input' : 'Voice Input (Speech to Text)'}
              className={`p-2.5 rounded-xl border transition-colors ${
                isRecording
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                  : 'bg-navy-700 text-slate-300 border-navy-600 hover:text-white hover:bg-navy-600'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this page..."
              className="flex-1 bg-navy-900 border border-navy-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-aqua-500 placeholder-slate-500"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-aqua-500 hover:bg-aqua-600 disabled:opacity-40 disabled:cursor-not-allowed text-navy-900 font-bold rounded-xl transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-center text-slate-400 mt-2">
            AI treats webpage text strictly as data. No automated submissions or dangerous actions.
          </div>
        </div>
      </div>
    </div>
  );
};
