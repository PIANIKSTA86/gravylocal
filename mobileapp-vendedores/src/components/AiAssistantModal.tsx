import React, { useState } from 'react';
import { Customer, Invoice } from '../types';
import { Sparkles, X, TrendingUp, Lightbulb, Send } from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  invoices?: Invoice[];
  onOpenOrderBuilder: () => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  customer,
  invoices = [],
  onOpenOrderBuilder,
}) => {
  const customerName = customer?.name || 'Cliente GRAVY';
  const [userQuery, setUserQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>(() => [
    {
      sender: 'ai',
      text: `¡Hola! He analizado el estado de la cuenta de **${customerName}**. Su cupo de crédito utilizado se encuentra controlado. ¿En qué puedo ayudarte hoy?`,
    },
  ]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const newMsg = userQuery;
    setUserQuery('');
    setMessages((prev) => [...prev, { sender: 'user', text: newMsg }]);

    setTimeout(() => {
      let aiResponse = `Para ${customerName}, la acción recomendada es registrar el pedido con sus condiciones de crédito habituales.`;
      if (newMsg.toLowerCase().includes('descuento') || newMsg.toLowerCase().includes('promo')) {
        aiResponse = `Ofrecer un 3% de descuento por pronto pago incentivará el recaudo inmediato de la cartera activa de ${customerName}.`;
      }
      setMessages((prev) => [...prev, { sender: 'ai', text: aiResponse }]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#5355a9] to-[#363789] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-[#80deea] text-[#005662] flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">
                GRAVY Sales AI
              </h3>
              <p className="text-xs text-cyan-200 font-medium">
                Asistente Inteligente de Ventas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset AI Insights Cards */}
        <div className="p-3 bg-indigo-50/50 border-b border-indigo-100 space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#5355a9]">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Sugerencias Inteligentes:</span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => {
                onClose();
                onOpenOrderBuilder();
              }}
              className="px-3 py-2 bg-white hover:bg-cyan-50 rounded-xl text-xs font-extrabold text-[#006876] border border-cyan-200 shadow-2xs whitespace-nowrap flex items-center space-x-1"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#006876]" />
              <span>Generar borrador de pedido sugerido</span>
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/40">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#006876] text-white rounded-br-none font-medium'
                    : 'bg-white text-gray-800 border border-gray-200 shadow-2xs rounded-bl-none font-normal'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Pregunta a la IA sobre cartera, sugeridos o promos..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-gray-100 rounded-xl text-xs font-semibold text-gray-900 border-0 focus:ring-2 focus:ring-[#006876] outline-none"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-xl bg-[#006876] text-white flex items-center justify-center hover:bg-[#005662] transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
