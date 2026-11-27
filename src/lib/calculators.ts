export type FinishTier = 'essential' | 'standard' | 'premium';

export interface CalculatorInputs {
  builtUpAreaSqFt: number;
  floors: number;
  finishTier: FinishTier;
  wallType: 'clay_brick' | 'aac_block';
  tileAreaSqFt: number;
  paintableAreaSqFt: number;
  ratePerSqFtInr?: number;
}

export interface StageCostRow {
  stage: string;
  sharePct: number;
  amountInr: number;
}

export interface CalculatorResults {
  ratePerSqFt: number;
  totalEstimatedCostInr: number;
  materialCostInr: number;
  labourCostInr: number;
  cementBags: number;
  steelKg: number;
  brickOrBlockCount: number;
  brickUnitLabel: string;
  sandCuFt: number;
  aggregateCuFt: number;
  concreteWetCum: number;
  concreteDryCum: number;
  tileBoxes: number;
  tileWithWastageSqFt: number;
  puttyKg: number;
  primerLitres: number;
  emulsionLitres: number;
  stageBreakdown: StageCostRow[];
  assumptions: string[];
}

export const TIER_RATES_INR: Record<FinishTier, { label: string; rate: number; summary: string }> = {
  essential: {
    label: 'Essential (Economical)',
    rate: 1950,
    summary: 'Standard RCC structure, chamber brick/fly-ash walls, standard vitrified tiles, basic sanitary & electrical.',
  },
  standard: {
    label: 'Standard (Most Popular)',
    rate: 2300,
    summary: 'Primary steel & Tier-1 cement, double-charge vitrified flooring, UPVC windows, branded CP fittings & putty-emulsion.',
  },
  premium: {
    label: 'Premium (Custom Architectural)',
    rate: 2850,
    summary: 'Enhanced structural allowances, natural granite/large-format tiles, Burma/Ghana teak main door, premium sanitary & lighting.',
  },
};

export function calculateConstructionEstimates(input: CalculatorInputs): CalculatorResults {
  const area = Math.max(100, input.builtUpAreaSqFt);
  const defaultRate = TIER_RATES_INR[input.finishTier].rate;
  const ratePerSqFt = input.ratePerSqFtInr && input.ratePerSqFtInr > 500 ? input.ratePerSqFtInr : defaultRate;

  const totalEstimatedCostInr = Math.round(area * ratePerSqFt);
  // Typical Indian residential split: ~65% Materials, ~35% Labour (excluding external compound/borewell)
  const materialCostInr = Math.round(totalEstimatedCostInr * 0.65);
  const labourCostInr = Math.round(totalEstimatedCostInr * 0.35);

  // Thumb rules per sq.ft of RCC framed residential built-up area (Tamil Nadu practice)
  const cementBags = Math.ceil(area * 0.42);
  const steelFactor = input.floors >= 2 ? 4.2 : 3.7; // kg per sq.ft
  const steelKg = Math.ceil(area * steelFactor);

  // Masonry units: ~9.5 clay bricks/sq.ft built-up or ~1.45 AAC blocks/sq.ft built-up
  const brickOrBlockCount =
    input.wallType === 'clay_brick' ? Math.ceil(area * 9.5) : Math.ceil(area * 1.45);
  const brickUnitLabel = input.wallType === 'clay_brick' ? 'Standard Clay Bricks' : 'AAC Blocks (600x200x200mm)';

  // Sand (concrete + masonry + plastering): ~1.85 cu.ft per sq.ft
  const sandCuFt = Math.ceil(area * 1.85);
  // Aggregate (20mm + 40mm): ~1.35 cu.ft per sq.ft
  const aggregateCuFt = Math.ceil(area * 1.35);

  // Concrete volume approx ~0.055 cum wet concrete per sq.ft (footings + columns + beams + slabs)
  const concreteWetCum = Number((area * 0.055).toFixed(1));
  const concreteDryCum = Number((concreteWetCum * 1.54).toFixed(1));

  // Flooring & tiles: requested tile area (default 80% of built-up) + 10% cutting/wastage
  const baseTileArea = input.tileAreaSqFt > 0 ? input.tileAreaSqFt : Math.round(area * 0.8);
  const tileWithWastageSqFt = Math.ceil(baseTileArea * 1.1);
  const tileBoxes = Math.ceil(tileWithWastageSqFt / 16); // ~16 sq.ft per 2x2 ft box (4 tiles)

  // Painting: paintable wall + ceiling area (~3.1x built-up area if not explicitly overridden)
  const paintArea = input.paintableAreaSqFt > 0 ? input.paintableAreaSqFt : Math.round(area * 3.1);
  const puttyKg = Math.ceil(paintArea / 14); // ~14 sq.ft/kg for 2 coats
  const primerLitres = Math.ceil(paintArea / 120); // ~120 sq.ft/litre (1 coat)
  const emulsionLitres = Math.ceil((paintArea / 130) * 2); // ~130 sq.ft/litre per coat, 2 coats

  const stageBreakdown: StageCostRow[] = [
    { stage: '1. Excavation, Foundation & Plinth', sharePct: 16, amountInr: Math.round(totalEstimatedCostInr * 0.16) },
    { stage: '2. RCC Frame (Columns, Beams & Roof Slabs)', sharePct: 24, amountInr: Math.round(totalEstimatedCostInr * 0.24) },
    { stage: '3. Brickwork / Blockwork & Lintel Bands', sharePct: 12, amountInr: Math.round(totalEstimatedCostInr * 0.12) },
    { stage: '4. Plastering (Internal & External)', sharePct: 8, amountInr: Math.round(totalEstimatedCostInr * 0.08) },
    { stage: '5. Flooring, Wall Tiles & Waterproofing', sharePct: 12, amountInr: Math.round(totalEstimatedCostInr * 0.12) },
    { stage: '6. Electrical & Plumbing Concealed + Fixtures', sharePct: 11, amountInr: Math.round(totalEstimatedCostInr * 0.11) },
    { stage: '7. Doors, Windows, Grills & Hardware', sharePct: 9, amountInr: Math.round(totalEstimatedCostInr * 0.09) },
    { stage: '8. Painting, Putty & Final Handover Prep', sharePct: 8, amountInr: Math.round(totalEstimatedCostInr * 0.08) },
  ];

  const assumptions = [
    `Built-up area of ${area.toLocaleString('en-IN')} sq.ft at an indicative rate of ₹${ratePerSqFt.toLocaleString('en-IN')}/sq.ft.`,
    `Cement factor: 0.42 bags/sq.ft · Steel factor: ${steelFactor} kg/sq.ft (${input.floors >= 2 ? 'multi-floor' : 'single-floor'} frame).`,
    'Concrete dry volume uses standard 1.54 bulking/voids factor over wet concrete volume.',
    'Tile calculation includes 10% cutting and corner wastage (assuming ~16 sq.ft per box).',
    'Excludes land registration, CMDA/DTCP approval fees, deep borewell, compound wall, septic/sump extras, and modular interiors.',
  ];

  return {
    ratePerSqFt,
    totalEstimatedCostInr,
    materialCostInr,
    labourCostInr,
    cementBags,
    steelKg,
    brickOrBlockCount,
    brickUnitLabel,
    sandCuFt,
    aggregateCuFt,
    concreteWetCum,
    concreteDryCum,
    tileBoxes,
    tileWithWastageSqFt,
    puttyKg,
    primerLitres,
    emulsionLitres,
    stageBreakdown,
    assumptions,
  };
}

export function formatInr(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
