import React, { useState } from 'react';
import { AlertTriangle, Plus, Send, Trash2 } from 'lucide-react';
import { useSensury } from '../context/SensuryContext';
import { AiChatMessage, AppPage } from '../types/sensury';
import { sendAiChatMessage } from '../lib/aiClient';

interface AssistantPageProps {
  onNavigate: (page: AppPage) => void;
}

const QUICK_PROMPTS_EN = [
  'Explain PPC vs OPC 53 cement for a house in Tamil Nadu in simple words.',
  'What hidden costs should I keep in mind beyond ₹/sq.ft contractor rates?',
  'What documents should I verify before buying a DTCP or CMDA plot?',
  'Check my active project plan and tell me what details are missing or risky.',
];

const QUICK_PROMPTS_TA = [
  'தமிழ்நாட்டில் வீடு கட்ட PPC மற்றும் OPC சிமெண்ட் எதற்கு எது சிறந்தது?',
  'மனை வாங்கும் முன் Patta, Chitta, FMB மற்றும் EC எப்படி சரிபார்க்க வேண்டும்?',
  'என் பட்ஜெட்டில் மறைமுக செலவுகள் (borewell, sump, EB) என்னென்ன இருக்கும்?',
];

export function AssistantPage({ onNavigate }: AssistantPageProps) {
  const { user, profile, activeProject, conversations, saveConversation, deleteConversation } = useSensury();

  const [activeConvId, setActiveConvId] = useState<string | undefined>(conversations[0]?.id);
  const [language, setLanguage] = useState<'en' | 'ta' | 'bilingual'>(
    profile?.preferredLanguage || 'en'
  );
  const [messages, setMessages] = useState<AiChatMessage[]>(conversations[0]?.messages || []);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!user) {
    return (
      <div className="bg-white border border-[#E7E5DF] rounded-xl p-8 max-w-2xl">
        <h1 className="font-display text-2xl font-bold text-[#14171A] mb-2">
          Sign in to use the SENSURY AI Home Assistant
        </h1>
        <p className="text-sm text-[#4A5056] leading-relaxed mb-6">
          Ask construction questions in English or Tamil, compare materials, inspect budget risks,
          and save conversations linked to your home project.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('auth')}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSelectConversation = (convId: string) => {
    const found = conversations.find((c) => c.id === convId);
    if (!found) return;
    setActiveConvId(found.id);
    setMessages(found.messages);
    setLanguage(found.language);
    setErrorMsg('');
  };

  const handleNewConversation = () => {
    setActiveConvId(undefined);
    setMessages([]);
    setErrorMsg('');
  };

  const handleSend = async (promptText?: string) => {
    const text = (promptText ?? input).trim();
    if (!text || sending) return;
    setErrorMsg('');
    if (!promptText) setInput('');

    const userMsg: AiChatMessage = {
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setSending(true);

    try {
      const projectContext = activeProject
        ? {
            projectName: activeProject.projectName,
            landLocation: activeProject.landLocation,
            district: activeProject.district,
            plotAreaSqFt: activeProject.plotAreaSqFt,
            plotType: activeProject.plotType,
            totalBudgetInr: activeProject.totalBudgetInr,
            floors: activeProject.floors,
            bedrooms: activeProject.bedrooms,
            builtUpAreaSqFt: activeProject.builtUpAreaSqFt,
            currentStageNumber: activeProject.currentStageNumber,
          }
        : null;

      const reply = await sendAiChatMessage({
        message: text,
        history: messages.map((m) => ({ role: m.role, text: m.text })),
        language,
        projectContext,
      });

      const assistantMsg: AiChatMessage = {
        role: 'model',
        text: reply,
        createdAt: new Date().toISOString(),
      };
      const finalMessages = [...nextHistory, assistantMsg];
      setMessages(finalMessages);

      const title =
        finalMessages[0]?.text.slice(0, 60) || 'Home Construction Consultation';
      const savedId = await saveConversation(
        {
          projectId: activeProject?.id || '',
          title,
          language,
          messages: finalMessages,
        },
        activeConvId
      );
      setActiveConvId(savedId);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to reach AI assistant.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E7E5DF]">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#14171A]">
            AI Home-Building Assistant
          </h1>
          <p className="text-sm text-[#4A5056] mt-1">
            Powered by Gemini · Supports English &amp; Tamil (தமிழ்) ·{' '}
            {activeProject ? `Context: ${activeProject.projectName}` : 'General Guidance'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-[#EFECE6] rounded-lg">
            {([
              { id: 'en', label: 'English' },
              { id: 'ta', label: 'தமிழ்' },
              { id: 'bilingual', label: 'EN + தமிழ்' },
            ] as const).map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setLanguage(lang.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  language === lang.id ? 'bg-white text-[#14171A] shadow-sm' : 'text-[#4A5056]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleNewConversation}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#14171A] bg-white border border-[#E7E5DF] rounded-lg hover:bg-[#F3F2EE] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Thread</span>
          </button>
        </div>
      </div>

      {/* Safety Disclaimer */}
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#92400E]">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold">Safety &amp; Legal Guidance:</span> SENSURY AI explains
          construction concepts, materials, and preliminary budgets. For structural calculations,
          soil testing, legal land title verification, and CMDA/DTCP permits, always consult qualified
          Structural Engineers, Licensed Architects, and Property Advocates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Saved Conversations */}
        <aside className="lg:col-span-4 bg-white border border-[#E7E5DF] rounded-xl p-4 space-y-2 h-fit">
          <p className="text-xs font-semibold text-[#4A5056] px-2 mb-2">Saved Consultations</p>
          {conversations.length === 0 ? (
            <p className="text-xs text-[#4A5056] px-2 py-4">
              Your saved AI threads will appear here.
            </p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs ${
                  activeConvId === conv.id ? 'bg-[#F3F8F5] text-[#154D34] font-semibold' : 'hover:bg-[#F9F8F6]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSelectConversation(conv.id)}
                  className="text-left flex-1 truncate cursor-pointer"
                >
                  {conv.title}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void deleteConversation(conv.id);
                    if (activeConvId === conv.id) handleNewConversation();
                  }}
                  className="p-1 text-[#4A5056] hover:text-[#DC2626] cursor-pointer shrink-0"
                  aria-label="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </aside>

        {/* Advisory Conversation Panel */}
        <div className="lg:col-span-8 bg-white border border-[#E7E5DF] rounded-xl flex flex-col min-h-[540px]">
          <div className="flex-1 p-6 space-y-5 overflow-y-auto max-h-[560px]">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-[#14171A]">
                  Ask anything about building your home in Tamil Nadu or India
                </p>
                <p className="text-xs text-[#4A5056]">
                  Choose a starter question or type your own below:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(language === 'ta' ? QUICK_PROMPTS_TA : QUICK_PROMPTS_EN).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void handleSend(q)}
                      className="text-left p-3 text-xs text-[#14171A] bg-[#F9F8F6] border border-[#E7E5DF] rounded-lg hover:bg-[#EFECE6] transition-colors cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={`${msg.createdAt}-${idx}`}
                  className={`p-4 rounded-xl ${
                    msg.role === 'user'
                      ? 'bg-[#F3F8F5] border border-[#154D34]/20 ml-6'
                      : 'bg-[#F9F8F6] border border-[#E7E5DF] mr-6'
                  }`}
                >
                  <p className="text-[11px] font-semibold text-[#4A5056] mb-1.5">
                    {msg.role === 'user' ? 'You' : 'SENSURY AI Guide'}
                  </p>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-[#14171A] leading-relaxed">
                    {msg.text}
                  </pre>
                </div>
              ))
            )}
            {sending && (
              <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#E7E5DF] mr-6 text-xs text-[#4A5056]">
                Reviewing your question and project details...
              </div>
            )}
            {errorMsg && <p className="text-xs text-[#DC2626]">{errorMsg}</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="p-4 border-t border-[#E7E5DF] flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language === 'ta'
                  ? 'உங்கள் வீடு கட்டும் சந்தேகத்தை கேளுங்கள்...'
                  : 'Ask about foundation, steel grades, DTCP approval, or budget risks...'
              }
              className="flex-1 px-3.5 py-2.5 text-sm bg-[#F9F8F6] border border-[#E7E5DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154D34]/20"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
