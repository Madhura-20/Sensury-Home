import { ConstructionStage } from '../types/sensury';

export const CONSTRUCTION_STAGES: ConstructionStage[] = [
  {
    number: 1,
    title: 'Understanding land and site selection',
    tamilTitle: 'நிலம் மற்றும் மனை தேர்வு',
    phase: 'Pre-Construction',
    simpleSummary:
      'Evaluate road width, flood elevation, soil firmness, groundwater depth, and neighbourhood utilities before buying or building on a plot.',
    whatHappens: [
      'Check approach road width (minimum 20–30 ft helps approvals and lorry access).',
      'Observe plot level relative to the street to avoid rainwater stagnation during monsoon.',
      'Check proximity to lakes, drains, high-tension lines, and existing EB poles.',
    ],
    materialsRequired: ['Survey tape', 'Soil trial pit or bore log (if soft/clayey soil)'],
    approximateDuration: '1–2 weeks',
    professionalSupport: ['Licensed Surveyor', 'Civil Engineer'],
    tamilNaduNotes:
      'In Tamil Nadu coastal or low-lying belts (such as South Chennai, Velachery, Cuddalore), check past flood levels and soil type carefully.',
  },
  {
    number: 2,
    title: 'Land documents and verification',
    tamilTitle: 'நில ஆவணங்கள் மற்றும் சரிபார்ப்பு',
    phase: 'Pre-Construction',
    simpleSummary:
      'Verify clear legal ownership and layout approvals so your family never faces title disputes or building approval rejection.',
    whatHappens: [
      'Review Mother Deed, Sale Deed, and 30-year Encumbrance Certificate (EC).',
      'Verify Patta, Chitta, and Field Measurement Book (FMB) sketch match physical boundaries.',
      'Confirm DTCP, CMDA, or Panchayat layout approval number.',
    ],
    materialsRequired: ['Copies of deeds', 'EC extract', 'FMB boundary sketch'],
    approximateDuration: '2–3 weeks',
    professionalSupport: ['Property Advocate', 'Taluk Surveyor'],
    tamilNaduNotes:
      'Use Tamil Nadu e-Services (TNREGINET & Tamil Nilam) with a qualified property lawyer to verify Patta, Chitta, and EC.',
  },
  {
    number: 3,
    title: 'Budget planning',
    tamilTitle: 'நிதி மற்றும் செலவுத் திட்டமிடல்',
    phase: 'Pre-Construction',
    simpleSummary:
      'Map your realistic total budget including building cost, approvals, borewell/sump, compound wall, EB connection, and a 10–15% safety buffer.',
    whatHappens: [
      'Separate land/approval fees from core construction and interior budgets.',
      'Decide finish level (Essential, Standard, or Premium) before drawing plans.',
      'Plan milestone cash flow or bank housing loan disbursement stages.',
    ],
    materialsRequired: ['Preliminary BOQ estimate', 'Stage-wise payment schedule'],
    approximateDuration: '1–2 weeks',
    professionalSupport: ['Civil Engineer / Quantity Estimator', 'Bank Loan Advisor'],
    tamilNaduNotes:
      'Keep 12–15% contingency for foundation depth variations, EB 3-phase deposit, septic/sump, and price changes.',
  },
  {
    number: 4,
    title: 'Architectural planning',
    tamilTitle: 'வீட்டு வரைபடம் மற்றும் வடிவமைப்பு',
    phase: 'Pre-Construction',
    simpleSummary:
      'Translate your family’s daily routine into room sizes, natural sunlight, cross-ventilation, staircases, and future expandability.',
    whatHappens: [
      'Prepare 2D floor plans showing setbacks, room dimensions, doors, and furniture layout.',
      'Plan courtyard/ventilation shafts for hot Tamil Nadu summers.',
      'Finalize exterior elevation and rainwater harvesting route.',
    ],
    materialsRequired: ['2D floor plan drawings', '3D elevation views'],
    approximateDuration: '3–5 weeks',
    professionalSupport: ['Registered Architect'],
    tamilNaduNotes:
      'Ensure setbacks comply with Tamil Nadu Combined Development and Building Rules (TNCDBR 2019) for your plot width.',
  },
  {
    number: 5,
    title: 'Structural design',
    tamilTitle: 'கட்டமைப்பு பொறியியல் வடிவமைப்பு',
    phase: 'Pre-Construction',
    simpleSummary:
      'Design safe concrete footings, columns, beams, and roof slabs based on soil strength and planned number of floors.',
    whatHappens: [
      'Conduct soil bearing capacity (SBC) check if building G+1 or higher or on black cotton/clay soil.',
      'Calculate steel bar sizes (8mm to 20mm), spacing, and concrete grade (typically M20/M25).',
      'Issue Good-for-Construction (GFC) structural drawings.',
    ],
    materialsRequired: ['Soil test report', 'Structural GFC drawings', 'Bar bending schedule'],
    approximateDuration: '2–3 weeks',
    professionalSupport: ['Structural Engineer'],
    tamilNaduNotes:
      'Never rely solely on contractor thumb-rules for column/footing steel—always obtain signed drawings from a Structural Engineer.',
  },
  {
    number: 6,
    title: 'Government approvals and permissions',
    tamilTitle: 'அரசு மற்றும் உள்ளாட்சி அனுமதிகள்',
    phase: 'Pre-Construction',
    simpleSummary:
      'Obtain official building plan sanction and temporary electricity/water setup before starting excavation.',
    whatHappens: [
      'Submit building plan online through Tamil Nadu single-window portal / local body.',
      'Pay scrutiny, infrastructure, and labour welfare board fees.',
      'Apply for temporary EB construction power and arrange site water.',
    ],
    materialsRequired: ['Sanction drawings', 'Ownership proofs', 'Licensed surveyor signature'],
    approximateDuration: '3–8 weeks',
    professionalSupport: ['Licensed Building Surveyor / Architect'],
    tamilNaduNotes:
      'CMDA (Chennai Metropolitan Area), DTCP, or Town/Village Panchayat rules apply depending on your local jurisdiction.',
  },
  {
    number: 7,
    title: 'Site preparation',
    tamilTitle: 'மனை தயார் செய்தல் மற்றும் குறியிடுதல்',
    phase: 'Substructure & Frame',
    simpleSummary:
      'Clear vegetation, level the plot, drill borewell or arrange water storage, build a material shed, and mark column lines accurately.',
    whatHappens: [
      'Clear shrubs/debris and verify plot corner stones against FMB sketch.',
      'Set up temporary site water tank and lockable cement storage.',
      'Mark building centerline on lime powder using right-angle (3-4-5) checks.',
    ],
    materialsRequired: ['Lime powder', 'Wooden pegs & nylon thread', 'Water storage tank'],
    approximateDuration: '1 week',
    professionalSupport: ['Site Engineer', 'Contractor'],
    tamilNaduNotes:
      'Verify diagonal measurements on site before digging so rooms stay perfectly square.',
  },
  {
    number: 8,
    title: 'Foundation construction',
    tamilTitle: 'அடித்தளம் (Foundation) கட்டுமானம்',
    phase: 'Substructure & Frame',
    simpleSummary:
      'Excavate pits, pour lean concrete (PCC), place footing steel cages, raise pedestal columns, and build the plinth beam above road level.',
    whatHappens: [
      'Excavate to firm soil depth specified in the structural drawing.',
      'Pour PCC bed, apply anti-termite soil treatment, and tie footing reinforcement.',
      'Build plinth beam, sump/septic tank, and compact earth filling inside the basement.',
    ],
    materialsRequired: ['Cement', '20mm & 40mm aggregates', 'M-Sand / River Sand', 'TMT Steel', 'Anti-termite chemical'],
    approximateDuration: '3–5 weeks',
    professionalSupport: ['Structural Engineer (footing inspection)', 'Civil Engineer', 'Contractor'],
    tamilNaduNotes:
      'Keep finished ground-floor plinth at least 2.5–3.5 ft above the crown of the road for drainage safety.',
  },
  {
    number: 9,
    title: 'Column, beam and slab work',
    tamilTitle: 'தூண்கள், பீம்கள் மற்றும் கூரை தளம் (RCC)',
    phase: 'Substructure & Frame',
    simpleSummary:
      'Erect the reinforced concrete skeleton (columns, lintels, roof beams, and roof slab) that carries the entire weight of your home.',
    whatHappens: [
      'Cast RCC columns in lifts with proper cover blocks and needle vibrator compaction.',
      'Erect centering/shuttering props securely and tie roof slab steel & electrical conduits.',
      'Pour roof slab concrete continuously and pond water on top for 14 days of curing.',
    ],
    materialsRequired: ['Cement (OPC 53 / PPC)', 'TMT Fe500D/Fe550D Steel', '20mm Aggregate', 'M-Sand', 'Conduit pipes', 'Cover blocks'],
    approximateDuration: '4–7 weeks per floor',
    professionalSupport: ['Structural Engineer (pre-pour steel check)', 'Site Engineer'],
    tamilNaduNotes:
      'Ensure steel inspection by your Structural Engineer BEFORE pouring every roof slab, and maintain 14 days continuous water ponding curing.',
  },
  {
    number: 10,
    title: 'Brickwork and walls',
    tamilTitle: 'செங்கல் / பிளாக் சுவர் கட்டுமானம்',
    phase: 'Masonry & Services',
    simpleSummary:
      'Build outer 9-inch (or 200mm AAC) walls and inner 4.5-inch partition walls, leaving accurate openings for doors, windows, and ventilators.',
    whatHappens: [
      'Soak clay bricks in water before laying (or use thin-bed mortar for AAC blocks).',
      'Cast RCC sill bands under windows and lintels/sunshades above openings.',
      'Check wall vertical plumb every 4–5 courses and cure brickwork for 7–10 days.',
    ],
    materialsRequired: ['Red Clay Bricks / Fly Ash Bricks / AAC Blocks', 'Cement', 'M-Sand / Block Adhesive', 'Concrete lintel steel'],
    approximateDuration: '3–5 weeks per floor',
    professionalSupport: ['Site Engineer', 'Masonry Contractor'],
    tamilNaduNotes:
      'Provide chicken mesh / fiber mesh at the junction where brickwork meets concrete columns to prevent hairline plaster cracks.',
  },
  {
    number: 11,
    title: 'Electrical and plumbing',
    tamilTitle: 'மின்சாரம் மற்றும் குழாய் பதிப்பு வேலைகள்',
    phase: 'Masonry & Services',
    simpleSummary:
      'Cut neat wall chases for concealed electrical conduits, water supply pipes, and drainage lines before plastering starts.',
    whatHappens: [
      'Mark switchboard heights, AC points, inverter backup circuit, and kitchen appliance points.',
      'Lay CPVC hot/cold water lines and UPVC waste/soil pipes with proper slope.',
      'Pressure-test all concealed plumbing lines BEFORE closing chases with mortar.',
    ],
    materialsRequired: ['FR/FRLS PVC Conduits', 'Metal Boxes', 'CPVC & UPVC Pipes', 'Solvent Cement', 'Floor Traps'],
    approximateDuration: '2–3 weeks',
    professionalSupport: ['Licensed Electrician', 'Plumber', 'Site Engineer'],
    tamilNaduNotes:
      'Always take photographs of concealed pipe and conduit routes with wall measurements before plastering so you never drill into a pipe later.',
  },
  {
    number: 12,
    title: 'Plastering',
    tamilTitle: 'பூச்சு வேலை (Plastering)',
    phase: 'Masonry & Services',
    simpleSummary:
      'Apply smooth cement-sand plaster coats on ceilings, internal walls, and external weather-exposed walls.',
    whatHappens: [
      'Hack concrete columns/ceilings and apply cement slurry bonding coat.',
      'Apply 12mm internal plaster with P-Sand (plastering sand) using spirit levels.',
      'Apply 15–20mm two-coat external plaster with waterproofing admixture and cure 7–10 days.',
    ],
    materialsRequired: ['PPC Cement', 'Fine P-Sand / Sieved River Sand', 'Waterproofing admixture', 'Chicken mesh'],
    approximateDuration: '3–4 weeks',
    professionalSupport: ['Site Engineer', 'Plastering Masons'],
    tamilNaduNotes:
      'Use fine plastering sand (P-Sand) rather than coarse concrete M-Sand for smoother walls and reduced hairline shrinkage cracks.',
  },
  {
    number: 13,
    title: 'Flooring and tiles',
    tamilTitle: 'தரை மற்றும் சுவர் டைல்ஸ் பதிப்பு',
    phase: 'Finishing & Handover',
    simpleSummary:
      'Waterproof wet areas, lay living room vitrified tiles, granite/marble steps, kitchen countertop, and anti-skid bathroom tiles.',
    whatHappens: [
      'Complete bathroom sunken slab waterproofing and flood-test for 48 hours.',
      'Lay floor tiles with uniform spacers and slope towards bathroom/balcony drains.',
      'Fill joints with stain-resistant grout or epoxy grout in wet areas.',
    ],
    materialsRequired: ['Vitrified / Ceramic Tiles', 'Granite Slabs', 'Tile Adhesive / Cement Mortar', 'Waterproofing Coat', 'Epoxy Grout'],
    approximateDuration: '3–4 weeks',
    professionalSupport: ['Tile Mason', 'Waterproofing Applicator'],
    tamilNaduNotes:
      'Always order 8–10% extra tiles from the same batch number so future replacements match the exact shade.',
  },
  {
    number: 14,
    title: 'Doors and windows',
    tamilTitle: 'கதவு மற்றும் ஜன்னல் பொருத்துதல்',
    phase: 'Finishing & Handover',
    simpleSummary:
      'Install main teak door, bedroom flush/engineered doors, UPVC/aluminium/wood windows, safety grills, and mosquito mesh.',
    whatHappens: [
      'Fix timber/UPVC frames securely and seal perimeter gaps with weather-resistant sealant.',
      'Install MS security grills and toughened glass where needed.',
      'Hang door shutters and fit hinges, tower bolts, and mortise locks.',
    ],
    materialsRequired: ['Teak / WPC / Flush Doors', 'UPVC / Timber Windows', 'MS Grills', 'SS Hinges & Locks'],
    approximateDuration: '2–3 weeks',
    professionalSupport: ['Carpenter', 'UPVC / Aluminium Fabricator'],
    tamilNaduNotes:
      'In humid coastal Tamil Nadu districts, UPVC or treated hardwood frames resist termite and moisture swelling better than untreated softwood.',
  },
  {
    number: 15,
    title: 'Painting',
    tamilTitle: 'வண்ணம் பூசுதல் (Painting)',
    phase: 'Finishing & Handover',
    simpleSummary:
      'Prepare plastered surfaces with wall putty, apply primer, and finish interiors and exteriors with durable emulsion coats.',
    whatHappens: [
      'Scrape loose sand, apply 2 coats of white cement-based putty, and sand smoothly.',
      'Apply 1 coat of interior/exterior primer.',
      'Apply 2 coats of interior emulsion and weatherproof exterior emulsion.',
    ],
    materialsRequired: ['Wall Putty', 'Interior & Exterior Primer', 'Emulsion Paints', 'Wood Polish / Enamel'],
    approximateDuration: '2–4 weeks',
    professionalSupport: ['Painting Contractor'],
    tamilNaduNotes:
      'Ensure walls are completely dry after plaster curing before applying putty, otherwise moisture can cause blistering.',
  },
  {
    number: 16,
    title: 'Interior and exterior finishing',
    tamilTitle: 'உள் மற்றும் வெளி அலங்கார வேலைகள்',
    phase: 'Finishing & Handover',
    simpleSummary:
      'Pull electrical wires, install switches, fans, lights, sanitaryware, modular kitchen, wardrobes, compound wall, and rainwater pit.',
    whatHappens: [
      'Pull copper FRLS wires, install MCB/RCCB distribution board, and test earthing.',
      'Fit bathroom taps, closets, washbasins, and water heater connections.',
      'Complete modular kitchen, wardrobes, gate, compound wall, and rainwater harvesting pit.',
    ],
    materialsRequired: ['Copper Wires & Switchgear', 'Sanitaryware & CP Fittings', 'Plywood/Laminates', 'Rainwater Filter'],
    approximateDuration: '4–6 weeks',
    professionalSupport: ['Interior Designer', 'Electrician', 'Plumber'],
    tamilNaduNotes:
      'Install a proper RCCB/ELCB earth-leakage breaker (30mA) in the main DB for family electrical safety.',
  },
  {
    number: 17,
    title: 'Quality inspection',
    tamilTitle: 'தரப் பரிசோதனை (Quality Inspection)',
    phase: 'Finishing & Handover',
    simpleSummary:
      'Walk through every room with a structured snag checklist to test slopes, switches, locks, plumbing pressure, and paint finish before final settlement.',
    whatHappens: [
      'Check hollow-sound tiles by tapping gently across rooms.',
      'Test every electrical socket, earthing polarity, MCB trip, and water tap drainage.',
      'Check terrace slope during water testing and verify all windows lock smoothly.',
    ],
    materialsRequired: ['Snag checklist', 'Socket tester', 'Spirit level'],
    approximateDuration: '1 week',
    professionalSupport: ['Site Engineer / Independent Quality Inspector'],
    tamilNaduNotes:
      'Hold 5% contractor retention until snag points are rectified and terrace/bathroom ponding checks pass.',
  },
  {
    number: 18,
    title: 'Final handover',
    tamilTitle: 'இறுதி ஒப்படைப்பு மற்றும் குடியேற்றம்',
    phase: 'Finishing & Handover',
    simpleSummary:
      'Collect as-built electrical/plumbing layouts, warranty cards, completion certificate, property tax assessment, and house keys.',
    whatHappens: [
      'Collect as-built drawings (especially concealed wiring & pipe routing).',
      'Collect appliance, waterproofing, UPVC, and sanitaryware warranty cards.',
      'Complete local body completion certificate, permanent EB service, and property tax registration.',
    ],
    materialsRequired: ['Warranty folder', 'As-built drawings', 'Key set & completion records'],
    approximateDuration: '1 week',
    professionalSupport: ['Contractor', 'Architect / Surveyor'],
    tamilNaduNotes:
      'Submit building completion notice to CMDA/DTCP/Local Body as applicable and convert temporary EB meter to permanent residential tariff.',
  },
];
