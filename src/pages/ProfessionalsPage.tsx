import React, { useState } from 'react';
import { CheckCircle2, Info, Trash2 } from 'lucide-react';
import { useSensury } from '../context/SensuryContext';
import { AppPage, ProfessionalRole, QuotationRequest } from '../types/sensury';
import { formatInr } from '../lib/calculators';

const ROLES: Array<'All' | ProfessionalRole> = [
  'All',
  'Architect',
  'Civil Engineer',
  'Structural Engineer',
  'Contractor',
  'Interior Designer',
  'Material Supplier',
];

interface ProfessionalsPageProps {
  onNavigate: (page: AppPage) => void;
}

export function ProfessionalsPage({ onNavigate }: ProfessionalsPageProps) {
  const { user, activeProject, directoryProfiles, quotations, createQuotation, updateQuotation, deleteQuotation } =
    useSensury();
  const [selectedRole, setSelectedRole] = useState<'All' | ProfessionalRole>('All');

  // Quotation Request Form
  const [roleCategory, setRoleCategory] = useState<ProfessionalRole>('Contractor');
  const [providerName, setProviderName] = useState('');
  const [scopeSummary, setScopeSummary] = useState('');
  const [budgetRange, setBudgetRange] = useState('₹20L – ₹35L');
  const [quotedAmountInr, setQuotedAmountInr] = useState<number>(0);
  const [timelineWeeks, setTimelineWeeks] = useState<number>(24);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');

  const filteredDirectory =
    selectedRole === 'All'
      ? directoryProfiles
      : directoryProfiles.filter((d) => d.role === selectedRole);

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onNavigate('auth');
      return;
    }
    if (!activeProject) {
      onNavigate('planner');
      return;
    }
    setSaving(true);
    setSavedNotice('');
    try {
      await createQuotation({
        roleCategory,
        providerName: providerName || 'Open Quotation Request',
        scopeSummary,
        budgetRange,
        quotedAmountInr: Number(quotedAmountInr || 0),
        timelineWeeks: Number(timelineWeeks || 0),
        status: quotedAmountInr > 0 ? 'received' : 'requested',
        notes,
      });
      setProviderName('');
      setScopeSummary('');
      setQuotedAmountInr(0);
      setNotes('');
      setSavedNotice('Quotation record saved to your project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-[#E7E5DF]">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#14171A]">
          Professional &amp; Supplier Connect
        </h1>
        <p className="text-sm text-[#4A5056] mt-1 max-w-3xl">
          Understand the 6 core roles on a residential build, prepare quotation requests, and compare
          contractor or supplier offers side by side for your home project.
        </p>
      </div>

      {/* Transparency Banner */}
      <div className="bg-[#F3F2EE] border border-[#E7E5DF] rounded-xl p-4 flex items-start gap-3 text-xs text-[#4A5056]">
        <Info className="w-4 h-4 text-[#154D34] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold text-[#14171A]">Directory Transparency:</span> Role cards
          marked <span className="font-semibold">Sample Template (Illustrative Only)</span> explain
          what qualifications to check—they are not fictional verified businesses. Always verify COA
          registration (Architects), structural degrees, GST registration, and completed site visits.
        </p>
      </div>

      {/* Role Filter */}
      <div className="flex flex-wrap gap-1.5">
        {ROLES.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setSelectedRole(role)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              selectedRole === role
                ? 'bg-[#154D34] text-white border-[#154D34]'
                : 'bg-white text-[#4A5056] border-[#E7E5DF] hover:text-[#14171A]'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Directory Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDirectory.map((prof) => (
          <div key={prof.id} className="bg-white border border-[#E7E5DF] rounded-xl p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-[#B45309] mb-1">
                {prof.role} · {prof.verificationLabel}
              </p>
              <h2 className="font-display text-lg font-semibold text-[#14171A] mb-1">{prof.name}</h2>
              <p className="text-xs text-[#4A5056] mb-3">{prof.district}</p>
              <p className="text-sm text-[#14171A] leading-relaxed mb-3">{prof.specialization}</p>
              <p className="text-xs text-[#4A5056] leading-relaxed">{prof.experienceNote}</p>
            </div>
            <button
              type="button"
              onClick={() => setRoleCategory(prof.role)}
              className="mt-5 px-3.5 py-2 text-xs font-semibold text-[#154D34] bg-[#F3F8F5] border border-[#154D34]/20 rounded-lg hover:bg-[#E5F0EA] w-fit cursor-pointer"
            >
              Draft {prof.role} Quote Request
            </button>
          </div>
        ))}
      </div>

      {/* Quotation Request & Offer Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-[#E7E5DF]">
        <form onSubmit={handleSubmitQuote} className="lg:col-span-5 bg-white border border-[#E7E5DF] rounded-xl p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-[#14171A]">
            Log Quotation Request / Offer
          </h2>
          {!activeProject && (
            <p className="text-xs text-[#B45309]">
              Create a project in My Home Planner first to save and compare offers.
            </p>
          )}
          <div>
            <label className="block text-xs font-medium text-[#14171A] mb-1">Role / Category</label>
            <select
              value={roleCategory}
              onChange={(e) => setRoleCategory(e.target.value as ProfessionalRole)}
              className="w-full px-3 py-2 text-sm border border-[#E7E5DF] rounded-lg"
            >
              {ROLES.filter((r) => r !== 'All').map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#14171A] mb-1">
              Professional / Firm / Supplier Name
            </label>
            <input
              type="text"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="e.g. Sri Murugan Builders / Architect Firm"
              className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#14171A] mb-1">Scope Summary</label>
            <textarea
              required
              rows={3}
              value={scopeSummary}
              onChange={(e) => setScopeSummary(e.target.value)}
              placeholder="e.g. G+1 1,600 sq.ft civil structure + plastering with Tier-1 cement & Fe550D steel"
              className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1">Target Budget</label>
              <input
                type="text"
                required
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E7E5DF] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1">Quoted (₹)</label>
              <input
                type="number"
                min={0}
                value={quotedAmountInr}
                onChange={(e) => setQuotedAmountInr(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono-num border border-[#E7E5DF] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1">Weeks</label>
              <input
                type="number"
                min={0}
                value={timelineWeeks}
                onChange={(e) => setTimelineWeeks(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono-num border border-[#E7E5DF] rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#14171A] mb-1">Inclusions / Exclusions Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Excludes sump, compound wall, EB charges"
              className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
            />
          </div>
          {savedNotice && (
            <p className="text-xs text-[#154D34] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{savedNotice}</span>
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] disabled:opacity-60 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Quotation Record'}
          </button>
        </form>

        {/* Saved Quotations Comparison */}
        <div className="lg:col-span-7 bg-white border border-[#E7E5DF] rounded-xl p-6">
          <h2 className="font-display text-lg font-semibold text-[#14171A] mb-4">
            Your Quotation Requests &amp; Offer Comparison
          </h2>
          {quotations.length === 0 ? (
            <p className="text-sm text-[#4A5056] py-8 text-center border border-dashed border-[#E7E5DF] rounded-lg">
              No quotation requests logged for this project yet. Record multiple contractor or
              architect quotes here to compare total cost, timeline, and exclusions cleanly.
            </p>
          ) : (
            <div className="space-y-4">
              {quotations.map((q) => (
                <div key={q.id} className="p-4 bg-[#F9F8F6] border border-[#E7E5DF] rounded-lg">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-xs font-medium text-[#154D34]">
                        {q.roleCategory} · {q.status.toUpperCase()}
                      </p>
                      <h3 className="font-semibold text-sm text-[#14171A]">{q.providerName}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono-num text-sm font-bold text-[#14171A]">
                        {q.quotedAmountInr > 0 ? formatInr(q.quotedAmountInr) : q.budgetRange}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteQuotation(q.id)}
                        className="p-1 text-[#4A5056] hover:text-[#DC2626] cursor-pointer"
                        aria-label="Delete quotation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[#4A5056] leading-relaxed mb-3">{q.scopeSummary}</p>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-[#4A5056]">
                      Timeline: {q.timelineWeeks} weeks {q.notes ? `· ${q.notes}` : ''}
                    </span>
                    <select
                      value={q.status}
                      onChange={(e) =>
                        updateQuotation(q.id, {
                          providerName: q.providerName,
                          quotedAmountInr: q.quotedAmountInr,
                          timelineWeeks: q.timelineWeeks,
                          status: e.target.value as QuotationRequest['status'],
                          notes: q.notes,
                        })
                      }
                      className="px-2.5 py-1 text-xs bg-white border border-[#E7E5DF] rounded-md"
                    >
                      <option value="requested">Requested</option>
                      <option value="received">Received</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
