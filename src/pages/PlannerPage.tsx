import React, { useEffect, useState } from 'react';
import { Bot, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { AppPage, FloorOption, PlotType } from '../types/sensury';
import { useSensury } from '../context/SensuryContext';
import { TAMIL_NADU_DISTRICTS } from '../data/referenceCatalog';
import { formatInr } from '../lib/calculators';
import { generateAiPlanSummary } from '../lib/aiClient';

interface PlannerPageProps {
  onNavigate: (page: AppPage) => void;
}

export function PlannerPage({ onNavigate }: PlannerPageProps) {
  const { user, projects, activeProject, saveProject, deleteProject } = useSensury();

  const [editingId, setEditingId] = useState<string | undefined>(activeProject?.id);
  const [projectName, setProjectName] = useState(activeProject?.projectName || 'Amma Illam — New Home');
  const [landLocation, setLandLocation] = useState(activeProject?.landLocation || '');
  const [district, setDistrict] = useState(activeProject?.district || 'Chennai');
  const [plotLengthFt, setPlotLengthFt] = useState(activeProject?.plotLengthFt || 40);
  const [plotWidthFt, setPlotWidthFt] = useState(activeProject?.plotWidthFt || 30);
  const [plotType, setPlotType] = useState<PlotType>(activeProject?.plotType || 'DTCP');
  const [totalBudgetInr, setTotalBudgetInr] = useState(activeProject?.totalBudgetInr || 3500000);
  const [floors, setFloors] = useState<FloorOption>(activeProject?.floors || 'G+1');
  const [bedrooms, setBedrooms] = useState(activeProject?.bedrooms || 3);
  const [bathrooms, setBathrooms] = useState(activeProject?.bathrooms || 3);
  const [kitchenType, setKitchenType] = useState(activeProject?.kitchenType || 'Modular + Wet Utility');
  const [parkingType, setParkingType] = useState(activeProject?.parkingType || '1 Covered Car + 2-Wheeler');
  const [houseStyle, setHouseStyle] = useState(activeProject?.houseStyle || 'Contemporary South Indian');
  const [additionalPreferences, setAdditionalPreferences] = useState(
    activeProject?.additionalPreferences || 'Senior-friendly ground floor bedroom, rainwater harvesting, good cross-ventilation.'
  );
  const [planningSummary, setPlanningSummary] = useState(activeProject?.planningSummary || '');

  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (activeProject && editingId === activeProject.id) {
      setProjectName(activeProject.projectName);
      setLandLocation(activeProject.landLocation);
      setDistrict(activeProject.district);
      setPlotLengthFt(activeProject.plotLengthFt);
      setPlotWidthFt(activeProject.plotWidthFt);
      setPlotType(activeProject.plotType);
      setTotalBudgetInr(activeProject.totalBudgetInr);
      setFloors(activeProject.floors);
      setBedrooms(activeProject.bedrooms);
      setBathrooms(activeProject.bathrooms);
      setKitchenType(activeProject.kitchenType);
      setParkingType(activeProject.parkingType);
      setHouseStyle(activeProject.houseStyle);
      setAdditionalPreferences(activeProject.additionalPreferences);
      setPlanningSummary(activeProject.planningSummary);
    }
  }, [activeProject, editingId]);

  const plotAreaSqFt = Math.max(100, Math.round(Number(plotLengthFt) * Number(plotWidthFt)));
  const floorMultiplier = floors === 'G' ? 1 : floors === 'G+1' ? 2 : floors === 'G+2' ? 3 : 4;
  // Conservative 68% ground coverage after setbacks for preliminary planning
  const recommendedFootprintSqFt = Math.round(plotAreaSqFt * 0.68);
  const builtUpAreaSqFt = Math.round(recommendedFootprintSqFt * floorMultiplier);
  const indicativeRatePerSqFt = 2300;
  const estimatedCostInr = Math.round(builtUpAreaSqFt * indicativeRatePerSqFt);
  const budgetGap = totalBudgetInr - estimatedCostInr;

  const buildDeterministicSummary = () => {
    const gapText =
      budgetGap >= 0
        ? `Your available budget (${formatInr(totalBudgetInr)}) has an estimated cushion of ${formatInr(budgetGap)} over the indicative core construction estimate (${formatInr(estimatedCostInr)}), which helps cover approvals, sump/borewell, compound wall, and contingencies.`
        : `Notice: At ${builtUpAreaSqFt.toLocaleString('en-IN')} sq.ft built-up area, the indicative standard-grade core construction cost (${formatInr(estimatedCostInr)}) exceeds your stated budget (${formatInr(totalBudgetInr)}) by ${formatInr(Math.abs(budgetGap))}. Consider reducing built-up area per floor, phasing an upper floor for later, or choosing Essential finishes.`;

    return [
      `PRELIMINARY HOME-PLANNING SUMMARY — ${projectName}`,
      `Location: ${landLocation || 'Site'}, ${district} · Plot: ${plotLengthFt} ft × ${plotWidthFt} ft (${plotAreaSqFt.toLocaleString('en-IN')} sq.ft) · Approval Type: ${plotType}`,
      ``,
      `1. Space & Built-Up Feasibility`,
      `• Assuming ~68% allowable ground coverage after TNCDBR setbacks, suggested ground footprint is ~${recommendedFootprintSqFt.toLocaleString('en-IN')} sq.ft.`,
      `• Across ${floors} (${floorMultiplier} level${floorMultiplier > 1 ? 's' : ''}), approximate total built-up area is ~${builtUpAreaSqFt.toLocaleString('en-IN')} sq.ft for ${bedrooms} bedrooms, ${bathrooms} bathrooms, ${kitchenType}, and ${parkingType}.`,
      ``,
      `2. Indicative Budget Sanity Check (₹${indicativeRatePerSqFt.toLocaleString('en-IN')}/sq.ft standard reference)`,
      `• Core Building Estimate: ${formatInr(estimatedCostInr)} (excludes land cost, CMDA/DTCP fees, deep borewell, compound wall, EB/water deposits, and modular interiors).`,
      `• ${gapText}`,
      ``,
      `3. Key Next Checks`,
      `• Verify Patta, Chitta, FMB sketch, and 30-year EC with a property advocate.`,
      `• Consult a licensed Architect & Structural Engineer to confirm exact road-width setbacks and soil bearing capacity before finalizing room sizes.`,
    ].join('\n');
  };

  const handleStartNew = () => {
    setEditingId(undefined);
    setProjectName('New Family Home');
    setLandLocation('');
    setPlanningSummary('');
    setStatusMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMessage('');
    if (!user) {
      onNavigate('auth');
      return;
    }
    if (landLocation.trim().length < 2) {
      setErrorMsg('Please enter the land area / locality name.');
      return;
    }

    const summaryToSave = planningSummary.trim() || buildDeterministicSummary();
    setPlanningSummary(summaryToSave);
    setSaving(true);
    try {
      const id = await saveProject(
        {
          projectName,
          landLocation,
          district,
          plotLengthFt: Number(plotLengthFt),
          plotWidthFt: Number(plotWidthFt),
          plotAreaSqFt,
          plotType,
          totalBudgetInr: Number(totalBudgetInr),
          floors,
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          kitchenType,
          parkingType,
          houseStyle,
          additionalPreferences,
          builtUpAreaSqFt,
          estimatedCostInr,
          planningSummary: summaryToSave,
          currentStageNumber: activeProject && activeProject.id === editingId ? activeProject.currentStageNumber : 1,
          completedStageNumbers: activeProject && activeProject.id === editingId ? activeProject.completedStageNumbers : [],
          status: activeProject && activeProject.id === editingId ? activeProject.status : 'planning',
        },
        editingId
      );
      setEditingId(id);
      setStatusMessage('Home plan saved to your account.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAiBrief = async () => {
    if (!user) {
      onNavigate('auth');
      return;
    }
    setAiLoading(true);
    setErrorMsg('');
    try {
      const brief = await generateAiPlanSummary({
        projectName,
        landLocation,
        district,
        plotLengthFt,
        plotWidthFt,
        plotAreaSqFt,
        plotType,
        totalBudgetInr,
        floors,
        bedrooms,
        bathrooms,
        kitchenType,
        parkingType,
        houseStyle,
        additionalPreferences,
        builtUpAreaSqFt,
        estimatedCostInr,
      });
      setPlanningSummary(brief);
      setStatusMessage('AI planning brief generated. Click "Save Home Plan" to store it.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not generate AI brief.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E7E5DF]">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#14171A]">
            My Home Planner
          </h1>
          <p className="text-sm text-[#4A5056] mt-1">
            Enter your land details, room requirements, and budget to generate a preliminary home-planning summary.
          </p>
        </div>
        {user && (
          <button
            type="button"
            onClick={handleStartNew}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#14171A] bg-white border border-[#E7E5DF] rounded-lg hover:bg-[#F3F2EE] whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project Plan</span>
          </button>
        )}
      </div>

      {projects.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#4A5056] mr-1">Saved Projects:</span>
          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setEditingId(p.id);
                setProjectName(p.projectName);
                setLandLocation(p.landLocation);
                setDistrict(p.district);
                setPlotLengthFt(p.plotLengthFt);
                setPlotWidthFt(p.plotWidthFt);
                setPlotType(p.plotType);
                setTotalBudgetInr(p.totalBudgetInr);
                setFloors(p.floors);
                setBedrooms(p.bedrooms);
                setBathrooms(p.bathrooms);
                setKitchenType(p.kitchenType);
                setParkingType(p.parkingType);
                setHouseStyle(p.houseStyle);
                setAdditionalPreferences(p.additionalPreferences);
                setPlanningSummary(p.planningSummary);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                editingId === p.id
                  ? 'bg-[#154D34] text-white border-[#154D34]'
                  : 'bg-white text-[#14171A] border-[#E7E5DF] hover:bg-[#F3F2EE]'
              }`}
            >
              {p.projectName}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white border border-[#E7E5DF] rounded-xl p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#14171A] mb-1.5">Project Name</label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154D34]/25"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1.5">Land Locality / Area</label>
              <input
                type="text"
                required
                value={landLocation}
                onChange={(e) => setLandLocation(e.target.value)}
                placeholder="e.g. Tambaram / Saravanampatti"
                className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154D34]/25"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1.5">District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154D34]/25"
              >
                {TAMIL_NADU_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1.5">Plot Length (ft)</label>
              <input
                type="number"
                min={10}
                max={500}
                required
                value={plotLengthFt}
                onChange={(e) => setPlotLengthFt(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm font-mono-num border border-[#E7E5DF] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1.5">Plot Width (ft)</label>
              <input
                type="number"
                min={10}
                max={500}
                required
                value={plotWidthFt}
                onChange={(e) => setPlotWidthFt(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm font-mono-num border border-[#E7E5DF] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1.5">Plot Approval Type</label>
              <select
                value={plotType}
                onChange={(e) => setPlotType(e.target.value as PlotType)}
                className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
              >
                <option value="DTCP">DTCP Approved</option>
                <option value="CMDA">CMDA Approved</option>
                <option value="Panchayat">Panchayat Approved</option>
                <option value="Patta">Patta / Ancestral Land</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1.5">Total Available Budget (₹ INR)</label>
              <input
                type="number"
                min={100000}
                step={50000}
                required
                value={totalBudgetInr}
                onChange={(e) => setTotalBudgetInr(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm font-mono-num border border-[#E7E5DF] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1.5">Number of Floors</label>
              <select
                value={floors}
                onChange={(e) => setFloors(e.target.value as FloorOption)}
                className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
              >
                <option value="G">Ground Floor Only (G)</option>
                <option value="G+1">Ground + 1 Floor (G+1)</option>
                <option value="G+2">Ground + 2 Floors (G+2)</option>
                <option value="G+3">Ground + 3 Floors (G+3)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#14171A] mb-1.5">Bedrooms</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono-num border border-[#E7E5DF] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#14171A] mb-1.5">Bathrooms</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono-num border border-[#E7E5DF] rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1.5">Kitchen Requirements</label>
              <select
                value={kitchenType}
                onChange={(e) => setKitchenType(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
              >
                <option value="Modular + Wet Utility">Modular Kitchen + Wet Utility</option>
                <option value="Open Kitchen + Dining">Open Kitchen + Dining</option>
                <option value="Traditional Closed Kitchen">Traditional Closed Kitchen</option>
                <option value="Dual Kitchen (Veg/Main + Utility)">Dual Kitchen + Outdoor Utility</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1.5">Parking Requirements</label>
              <select
                value={parkingType}
                onChange={(e) => setParkingType(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
              >
                <option value="1 Covered Car + 2-Wheeler">1 Covered Car + Two-Wheelers</option>
                <option value="2 Covered Cars">2 Covered Cars</option>
                <option value="Two-Wheeler Porch Only">Two-Wheeler Porch Only</option>
                <option value="Stilt Parking (Full Ground)">Stilt Parking (Full Ground)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#14171A] mb-1.5">House Style</label>
              <select
                value={houseStyle}
                onChange={(e) => setHouseStyle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
              >
                <option value="Contemporary South Indian">Contemporary South Indian (Courtyard / Pergola)</option>
                <option value="Modern Minimalist">Modern Minimalist</option>
                <option value="Traditional Chettinad Inspired">Traditional Verandah / Chettinad Inspired</option>
                <option value="Compact Practical Family Home">Compact Practical Family Home</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#14171A] mb-1.5">Additional Family Preferences</label>
              <textarea
                rows={3}
                value={additionalPreferences}
                onChange={(e) => setAdditionalPreferences(e.target.value)}
                placeholder="Vastu direction, senior-friendly room on ground floor, solar readiness, rainwater pit..."
                className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
              />
            </div>
          </div>

          {errorMsg && <p className="text-xs text-[#DC2626]">{errorMsg}</p>}
          {statusMessage && (
            <p className="text-xs text-[#154D34] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{statusMessage}</span>
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] disabled:opacity-60 cursor-pointer"
              >
                {saving ? 'Saving...' : editingId ? 'Update Home Plan' : 'Save Home Plan'}
              </button>
              <button
                type="button"
                disabled={aiLoading}
                onClick={handleGenerateAiBrief}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#14171A] bg-[#F3F2EE] border border-[#E7E5DF] rounded-lg hover:bg-[#E7E5DF] disabled:opacity-60 cursor-pointer"
              >
                <Bot className="w-4 h-4 text-[#154D34]" />
                <span>{aiLoading ? 'Analyzing with Gemini...' : 'Generate AI Planning Brief'}</span>
              </button>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={async () => {
                  await deleteProject(editingId);
                  handleStartNew();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#DC2626] hover:bg-red-50 rounded-lg cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </form>

        {/* Live Preliminary Summary */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-[#E7E5DF] rounded-xl p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-[#14171A]">
              Live Feasibility Snapshot
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-[#F9F8F6] rounded-lg border border-[#E7E5DF]">
                <p className="text-xs text-[#4A5056]">Plot Area</p>
                <p className="font-mono-num text-lg font-semibold text-[#14171A]">
                  {plotAreaSqFt.toLocaleString('en-IN')} sq.ft
                </p>
              </div>
              <div className="p-3 bg-[#F9F8F6] rounded-lg border border-[#E7E5DF]">
                <p className="text-xs text-[#4A5056]">Est. Built-Up ({floors})</p>
                <p className="font-mono-num text-lg font-semibold text-[#14171A]">
                  {builtUpAreaSqFt.toLocaleString('en-IN')} sq.ft
                </p>
              </div>
              <div className="p-3 bg-[#F9F8F6] rounded-lg border border-[#E7E5DF]">
                <p className="text-xs text-[#4A5056]">Indicative Core Build</p>
                <p className="font-mono-num text-lg font-semibold text-[#14171A]">
                  {formatInr(estimatedCostInr)}
                </p>
              </div>
              <div className="p-3 bg-[#F9F8F6] rounded-lg border border-[#E7E5DF]">
                <p className="text-xs text-[#4A5056]">Budget Headroom</p>
                <p
                  className={`font-mono-num text-lg font-semibold ${
                    budgetGap >= 0 ? 'text-[#154D34]' : 'text-[#DC2626]'
                  }`}
                >
                  {budgetGap >= 0 ? `+${formatInr(budgetGap)}` : `-${formatInr(Math.abs(budgetGap))}`}
                </p>
              </div>
            </div>
            <p className="text-xs text-[#4A5056] leading-relaxed">
              Preliminary figures assume ~68% ground coverage after setbacks and ₹2,300/sq.ft standard
              Tamil Nadu construction cost. Always verify setbacks and structural sizing with a licensed Architect and Civil Engineer.
            </p>
          </div>

          <div className="bg-white border border-[#E7E5DF] rounded-xl p-6">
            <h2 className="font-display text-lg font-semibold text-[#14171A] mb-3">
              Preliminary Planning Summary
            </h2>
            <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-[#4A5056] leading-relaxed">
              {planningSummary || buildDeterministicSummary()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
