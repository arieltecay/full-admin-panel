import React from 'react';
import { Bot, Send, Loader2 } from 'lucide-react';
import { Card } from '../../../../../components/ui/Card';
import type { AIAssistantProps, ChatMessage } from './types';

/**
 * Asistente AI para el administrador con tipado estricto.
 */
export const AIAssistant: React.FC<AIAssistantProps> = ({ 
  messages, input, setInput, onSend, isLoading 
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 w-80">
      <Card className="shadow-2xl border-slate-200">
        <div className="p-4 border-b border-slate-100 flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg">
            <Bot size={18} className="text-indigo-500" />
          </div>
          <span className="font-bold text-slate-800 text-sm">Auditor AI (Admin)</span>
        </div>
        
        <div className="h-64 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
          {messages.map((msg: ChatMessage, i: number) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-2.5 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white border border-slate-100 text-slate-700'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 p-2.5 rounded-2xl">
                <Loader2 size={14} className="animate-spin text-slate-400" />
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-slate-100 flex items-center space-x-2">
          <input
            className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            placeholder="Analizar datos..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isLoading && onSend()}
          />
          <button 
            onClick={onSend} 
            disabled={isLoading || !input.trim()}
            className="p-2 bg-indigo-600 text-white rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-colors"
          >
            {isLoading ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistant;
