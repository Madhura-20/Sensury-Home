import React, { useMemo, useState } from 'react';
import { Bookmark, BookmarkCheck, Bot, Search } from 'lucide-react';
import { MATERIAL_CATEGORIES } from '../data/referenceCatalog';
import { useSensury } from '../context/SensuryContext';
import { AppPage, MaterialItem } from '../types/sensury';
import { explainMaterialWithAi } from '../lib/aiClient';
import { ResilientImage } from '../components/ResilientImage';

interface MaterialsPageProps {
  onNavigate: (page: AppPage) => void;
}

export function MaterialsPage({ onNavigate }: MaterialsPageProps) {
  const { user, profile, materials, toggleSavedMaterial } = useSensury();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMaterial, setActiveMaterial] = useState<MaterialItem | null>(materials[0] || null);
  const [aiLang, setAiLang] = useState<'en' | 'ta'>(profile?.preferredLanguage || 'en');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiError, setAiError] = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return materials.filter((m) => {
      const catMatch = selectedCategory === 'All' || m.category === selectedCategory;
      const textMatch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.indianStandards.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q);
      return catMatch && textMatch;
    });
  }, [materials, selectedCategory, searchQuery]);

  const savedIds = profile?.savedMaterialIds || [];

  const handleSelectMaterial = (mat: MaterialItem) => {
    setActiveMaterial(mat);
    setAiExplanation('');
    setAiError('');
  };

  const handleExplainWithAi = async () => {
    if (!activeMaterial) return;
    if (!user) {
      onNavigate('auth');
      return;
    }
    setAiLoading(true);
    setAiError('');
    try {
      const res = await explainMaterialWithAi({
        materialName: activeMaterial.name,
        category: activeMaterial.category,
        language: aiLang,
      });
      setAiExplanation(res);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Unable to generate explanation.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-[#E7E5DF]">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#14171A]">
          Materials Knowledge Centre
        </h1>
        <p className="text-sm text-[#4A5056] mt-1 max-w-3xl">
          Understand every construction material across 13 categories. Each entry clearly separates
          verified Indian Standard references, manufacturer claims, supplier notes, and AI-generated plain explanations.
        </p>
      </div>

      {/* Search + Category Filter */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#4A5056] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cement, TMT steel, IS 1786, AAC, CPVC..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-[#E7E5DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154D34]/20"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['All', ...MATERIAL_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#154D34] text-white border-[#154D34]'
                  : 'bg-white text-[#4A5056] border-[#E7E5DF] hover:text-[#14171A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Material List */}
        <div className="lg:col-span-5 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="bg-white border border-[#E7E5DF] rounded-xl p-6 text-sm text-[#4A5056]">
              No materials match your search filter.
            </div>
          ) : (
            filtered.map((mat) => {
              const isSelected = activeMaterial?.id === mat.id;
              const isSaved = savedIds.includes(mat.id);
              return (
                <div
                  key={mat.id}
                  className={`bg-white border rounded-xl p-4 transition-colors ${
                    isSelected ? 'border-[#154D34]' : 'border-[#E7E5DF] hover:border-[#C9C5BC]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectMaterial(mat)}
                      className="text-left flex-1 min-w-0 cursor-pointer"
                    >
                      <p className="text-xs text-[#4A5056] mb-1">
                        {mat.category} · {mat.sourceType}
                      </p>
                      <h2 className="font-display text-base font-semibold text-[#14171A]">
                        {mat.name}
                      </h2>
                      <p className="text-xs text-[#4A5056] mt-1 line-clamp-2">{mat.summary}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => (user ? toggleSavedMaterial(mat.id) : onNavigate('auth'))}
                      className="p-2 text-[#4A5056] hover:text-[#154D34] shrink-0 cursor-pointer"
                      title={isSaved ? 'Remove from saved materials' : 'Save material'}
                      aria-label={isSaved ? 'Unsave material' : 'Save material'}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-[#154D34]" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Material Detail Sheet */}
        <div className="lg:col-span-7">
          {activeMaterial ? (
            <div className="bg-white border border-[#E7E5DF] rounded-xl overflow-hidden">
              {activeMaterial.imageUrl && (
                <div className="h-48 overflow-hidden border-b border-[#E7E5DF]">
                  <ResilientImage
                    src={activeMaterial.imageUrl}
                    alt={activeMaterial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 sm:p-8 space-y-6">
                <div className="border-b border-[#E7E5DF] pb-5">
                  <p className="text-xs font-medium text-[#154D34] mb-1">
                    {activeMaterial.category} · Source Attribution: {activeMaterial.sourceType}
                  </p>
                  <h2 className="font-display text-2xl font-bold text-[#14171A]">
                    {activeMaterial.name}
                  </h2>
                  <p className="text-sm text-[#4A5056] leading-relaxed mt-2">
                    {activeMaterial.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                  <div>
                    <h3 className="text-xs font-semibold text-[#14171A] mb-1">Types &amp; Classifications</h3>
                    <p className="text-[#4A5056] leading-relaxed">{activeMaterial.types}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#14171A] mb-1">Common Applications</h3>
                    <p className="text-[#4A5056] leading-relaxed">{activeMaterial.applications}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#14171A] mb-1">Quality Checks &amp; Specifications</h3>
                    <p className="text-[#4A5056] leading-relaxed">{activeMaterial.qualitySpecs}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#14171A] mb-1">Applicable Indian Standards (BIS)</h3>
                    <p className="text-[#154D34] font-medium leading-relaxed">{activeMaterial.indianStandards}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#14171A] mb-1">Advantages</h3>
                    <p className="text-[#4A5056] leading-relaxed">{activeMaterial.pros}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#14171A] mb-1">Limitations / Watch-outs</h3>
                    <p className="text-[#4A5056] leading-relaxed">{activeMaterial.cons}</p>
                  </div>
                </div>

                {/* Price & Attribution Panel */}
                <div className="bg-[#F9F8F6] border border-[#E7E5DF] rounded-xl p-5 space-y-3 text-xs">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-semibold text-[#14171A]">Indicative Price Information</span>
                    <span className="text-[#4A5056]">
                      {activeMaterial.priceLocation} · {activeMaterial.priceDate}
                    </span>
                  </div>
                  <p className="font-mono-num text-sm font-semibold text-[#14171A]">
                    {activeMaterial.indicativePrice}
                  </p>
                  <p className="text-[#4A5056]">
                    <span className="font-medium text-[#14171A]">Example Brands:</span> {activeMaterial.brandExamples}
                  </p>
                  <p className="text-[#4A5056]">
                    <span className="font-medium text-[#14171A]">Manufacturer Claims &amp; Certificates:</span> {activeMaterial.manufacturerNotes}
                  </p>
                  <p className="text-[#4A5056]">
                    <span className="font-medium text-[#14171A]">Supplier &amp; Delivery Notes:</span> {activeMaterial.supplierNotes}
                  </p>
                </div>

                {/* AI Explanation Section */}
                <div className="border-t border-[#E7E5DF] pt-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[#14171A]">
                        Plain-Language Site Guide (AI-Generated Explanation)
                      </h3>
                      <p className="text-xs text-[#4A5056]">
                        Ask Gemini to explain how to inspect this material on site in simple English or Tamil.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={aiLang}
                        onChange={(e) => setAiLang(e.target.value as 'en' | 'ta')}
                        className="px-2.5 py-1.5 text-xs border border-[#E7E5DF] rounded-lg bg-white"
                        aria-label="Explanation language"
                      >
                        <option value="en">English</option>
                        <option value="ta">தமிழ் (Tamil)</option>
                      </select>
                      <button
                        type="button"
                        disabled={aiLoading}
                        onClick={handleExplainWithAi}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] disabled:opacity-60 cursor-pointer"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>{aiLoading ? 'Explaining...' : 'Explain with AI'}</span>
                      </button>
                    </div>
                  </div>
                  {aiError && <p className="text-xs text-[#DC2626]">{aiError}</p>}
                  {aiExplanation && (
                    <div className="bg-[#F3F2EE] border border-[#E7E5DF] rounded-lg p-4">
                      <p className="text-[11px] font-semibold text-[#B45309] mb-2">
                        AI-Generated Educational Guidance (Verify exact site grades with your Civil Engineer)
                      </p>
                      <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-[#14171A] leading-relaxed">
                        {aiExplanation}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
