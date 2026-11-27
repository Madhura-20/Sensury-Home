import React, { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  calculateConstructionEstimates,
  FinishTier,
  formatInr,
  TIER_RATES_INR,
} from '../lib/calculators';
import { useSensury } from '../context/SensuryContext';

export function CalculatorPage() {
  const { activeProject } = useSensury();

  const [builtUpAreaSqFt, setBuiltUpAreaSqFt] = useState<number>(
    activeProject?.builtUpAreaSqFt || 1500
  );
  const [floors, setFloors] = useState<number>(
    activeProject?.floors === 'G' ? 1 : activeProject?.floors === 'G+2' ? 3 : 2
  );
  const [finishTier, setFinishTier] = useState<FinishTier>('standard');
  const [customRate, setCustomRate] = useState<string>('');
  const [wallType, setWallType] = useState<'clay_brick' | 'aac_block'>('clay_brick');
  const [tileAreaSqFt, setTileAreaSqFt] = useState<number>(1200);
  const [paintableAreaSqFt, setPaintableAreaSqFt] = useState<number>(4650);

  const results = useMemo(
    () =>
      calculateConstructionEstimates({
        builtUpAreaSqFt,
        floors,
        finishTier,
        wallType,
        tileAreaSqFt,
        paintableAreaSqFt,
        ratePerSqFtInr: customRate ? Number(customRate) : undefined,
      }),
    [builtUpAreaSqFt, floors, finishTier, wallType, tileAreaSqFt, paintableAreaSqFt, customRate]
  );

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-[#E7E5DF]">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#14171A]">
          Cost &amp; Quantity Calculators
        </h1>
        <p className="text-sm text-[#4A5056] mt-1 max-w-3xl">
          Preliminary estimation for overall construction cost, cement, steel, bricks/AAC, sand,
          aggregates, concrete, flooring, painting, labour, and stage-wise expenses.
        </p>
      </div>

      {/* Mandatory Engineering Verification Disclaimer */}
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4 flex items-start gap-3 text-xs text-[#92400E]">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold">Preliminary Estimate Notice:</span> All quantities and
          INR costs below are indicative thumb-rule estimates for Tamil Nadu residential homes.
          Soil depth, structural steel design, and local material quotes vary significantly—always
          have a qualified Civil Engineer or Quantity Surveyor prepare a formal Bill of Quantities
          (BOQ) before purchasing materials or signing contracts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inputs */}
        <div className="lg:col-span-5 bg-white border border-[#E7E5DF] rounded-xl p-6 space-y-5">
          <h2 className="font-display text-lg font-semibold text-[#14171A]">
            Project Measurements
          </h2>

          <div>
            <label className="block text-xs font-medium text-[#14171A] mb-1.5">
              Total Built-Up Area (sq.ft)
            </label>
            <input
              type="number"
              min={200}
              max={50000}
              value={builtUpAreaSqFt}
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                setBuiltUpAreaSqFt(val);
                setTileAreaSqFt(Math.round(val * 0.8));
                setPaintableAreaSqFt(Math.round(val * 3.1));
              }}
              className="w-full px-3.5 py-2 text-sm font-mono-num border border-[#E7E5DF] rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1.5">Floors</label>
              <select
                value={floors}
                onChange={(e) => setFloors(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-[#E7E5DF] rounded-lg"
              >
                <option value={1}>G (1 Floor)</option>
                <option value={2}>G+1 (2 Floors)</option>
                <option value={3}>G+2 (3 Floors)</option>
                <option value={4}>G+3 (4 Floors)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1.5">Wall Material</label>
              <select
                value={wallType}
                onChange={(e) => setWallType(e.target.value as 'clay_brick' | 'aac_block')}
                className="w-full px-3 py-2 text-sm border border-[#E7E5DF] rounded-lg"
              >
                <option value="clay_brick">Red Clay Bricks</option>
                <option value="aac_block">AAC Blocks (200mm)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#14171A] mb-1.5">
              Finish Specification Tier
            </label>
            <div className="space-y-2">
              {(Object.keys(TIER_RATES_INR) as FinishTier[]).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => {
                    setFinishTier(tier);
                    setCustomRate('');
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                    finishTier === tier && !customRate
                      ? 'border-[#154D34] bg-[#F3F8F5]'
                      : 'border-[#E7E5DF] hover:bg-[#F9F8F6]'
                  }`}
                >
                  <div className="flex justify-between text-xs font-semibold text-[#14171A]">
                    <span>{TIER_RATES_INR[tier].label}</span>
                    <span className="font-mono-num">
                      ₹{TIER_RATES_INR[tier].rate.toLocaleString('en-IN')}/sq.ft
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4A5056] mt-1">{TIER_RATES_INR[tier].summary}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1">
                Custom Rate (₹/sq.ft)
              </label>
              <input
                type="number"
                placeholder={String(TIER_RATES_INR[finishTier].rate)}
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono-num border border-[#E7E5DF] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1">
                Tile Area (sq.ft)
              </label>
              <input
                type="number"
                value={tileAreaSqFt}
                onChange={(e) => setTileAreaSqFt(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono-num border border-[#E7E5DF] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1">
                Paint Area (sq.ft)
              </label>
              <input
                type="number"
                value={paintableAreaSqFt}
                onChange={(e) => setPaintableAreaSqFt(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono-num border border-[#E7E5DF] rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cost + Labour Summary */}
          <div className="bg-white border border-[#E7E5DF] rounded-xl p-6">
            <h2 className="font-display text-lg font-semibold text-[#14171A] mb-4">
              Estimated Construction &amp; Labour Cost
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#F9F8F6] border border-[#E7E5DF] rounded-lg">
                <p className="text-xs text-[#4A5056]">Total Core Estimate</p>
                <p className="font-mono-num text-xl font-bold text-[#14171A] mt-1">
                  {formatInr(results.totalEstimatedCostInr)}
                </p>
                <p className="text-[11px] text-[#4A5056] mt-1">
                  @ ₹{results.ratePerSqFt.toLocaleString('en-IN')}/sq.ft
                </p>
              </div>
              <div className="p-4 bg-[#F9F8F6] border border-[#E7E5DF] rounded-lg">
                <p className="text-xs text-[#4A5056]">Est. Material Share (~65%)</p>
                <p className="font-mono-num text-xl font-bold text-[#14171A] mt-1">
                  {formatInr(results.materialCostInr)}
                </p>
              </div>
              <div className="p-4 bg-[#F9F8F6] border border-[#E7E5DF] rounded-lg">
                <p className="text-xs text-[#4A5056]">Est. Labour Share (~35%)</p>
                <p className="font-mono-num text-xl font-bold text-[#14171A] mt-1">
                  {formatInr(results.labourCostInr)}
                </p>
              </div>
            </div>
          </div>

          {/* Material Quantities Grid */}
          <div className="bg-white border border-[#E7E5DF] rounded-xl p-6">
            <h2 className="font-display text-lg font-semibold text-[#14171A] mb-4">
              Estimated Material Quantities
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E7E5DF] text-left text-xs text-[#4A5056]">
                    <th className="py-2.5 pr-4 font-medium">Material Calculator</th>
                    <th className="py-2.5 px-4 font-medium text-right">Estimated Quantity</th>
                    <th className="py-2.5 pl-4 font-medium">Notes / Formula Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5DF]">
                  <tr>
                    <td className="py-3 pr-4 font-medium text-[#14171A]">Cement</td>
                    <td className="py-3 px-4 text-right font-mono-num font-semibold">
                      {results.cementBags.toLocaleString('en-IN')} bags
                    </td>
                    <td className="py-3 pl-4 text-xs text-[#4A5056]">50 kg bags (0.42 bags/sq.ft)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-[#14171A]">TMT Steel</td>
                    <td className="py-3 px-4 text-right font-mono-num font-semibold">
                      {results.steelKg.toLocaleString('en-IN')} kg ({(results.steelKg / 1000).toFixed(2)} MT)
                    </td>
                    <td className="py-3 pl-4 text-xs text-[#4A5056]">
                      {floors >= 2 ? '4.2' : '3.7'} kg/sq.ft structural thumb rule
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-[#14171A]">{results.brickUnitLabel}</td>
                    <td className="py-3 px-4 text-right font-mono-num font-semibold">
                      {results.brickOrBlockCount.toLocaleString('en-IN')} pcs
                    </td>
                    <td className="py-3 pl-4 text-xs text-[#4A5056]">External 9&quot; + internal 4.5&quot; walls</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-[#14171A]">M-Sand &amp; P-Sand</td>
                    <td className="py-3 px-4 text-right font-mono-num font-semibold">
                      {results.sandCuFt.toLocaleString('en-IN')} cu.ft ({(results.sandCuFt / 100).toFixed(1)} units)
                    </td>
                    <td className="py-3 pl-4 text-xs text-[#4A5056]">Concrete + masonry + plastering</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-[#14171A]">Aggregates (20mm &amp; 40mm)</td>
                    <td className="py-3 px-4 text-right font-mono-num font-semibold">
                      {results.aggregateCuFt.toLocaleString('en-IN')} cu.ft ({(results.aggregateCuFt / 100).toFixed(1)} units)
                    </td>
                    <td className="py-3 pl-4 text-xs text-[#4A5056]">PCC + RCC columns, beams &amp; slabs</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-[#14171A]">Concrete Volume (M20)</td>
                    <td className="py-3 px-4 text-right font-mono-num font-semibold">
                      {results.concreteWetCum} m³ wet ({results.concreteDryCum} m³ dry)
                    </td>
                    <td className="py-3 pl-4 text-xs text-[#4A5056]">1.54 dry-to-wet factor</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-[#14171A]">Flooring &amp; Tiles</td>
                    <td className="py-3 px-4 text-right font-mono-num font-semibold">
                      {results.tileWithWastageSqFt.toLocaleString('en-IN')} sq.ft (~{results.tileBoxes} boxes)
                    </td>
                    <td className="py-3 pl-4 text-xs text-[#4A5056]">Includes 10% cutting wastage</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-[#14171A]">Painting (Putty + Primer + 2-Coat)</td>
                    <td className="py-3 px-4 text-right font-mono-num font-semibold">
                      {results.puttyKg} kg putty · {results.primerLitres}L primer · {results.emulsionLitres}L paint
                    </td>
                    <td className="py-3 pl-4 text-xs text-[#4A5056]">2 coats putty + 1 primer + 2 emulsion</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Stage-wise Expense Breakdown */}
          <div className="bg-white border border-[#E7E5DF] rounded-xl p-6">
            <h2 className="font-display text-lg font-semibold text-[#14171A] mb-4">
              Stage-Wise Indicative Expense Breakdown
            </h2>
            <div className="space-y-3">
              {results.stageBreakdown.map((row) => (
                <div key={row.stage}>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="text-[#14171A] font-medium">{row.stage}</span>
                    <span className="font-mono-num text-[#14171A]">
                      {row.sharePct}% · {formatInr(row.amountInr)}
                    </span>
                  </div>
                  <div className="h-2 bg-[#F3F2EE] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#154D34] rounded-full"
                      style={{ width: `${row.sharePct * 3.5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E7E5DF]">
              <p className="text-xs font-semibold text-[#14171A] mb-2">Assumptions Used</p>
              <ul className="space-y-1 text-xs text-[#4A5056]">
                {results.assumptions.map((a) => (
                  <li key={a}>· {a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
