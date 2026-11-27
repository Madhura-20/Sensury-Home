import React, { useState } from 'react';
import { CheckCircle2, Database } from 'lucide-react';
import { useSensury } from '../context/SensuryContext';
import { MATERIAL_CATEGORIES } from '../data/referenceCatalog';
import { ProfessionalRole, SourceAttribution } from '../types/sensury';

export function AdminPage() {
  const {
    isAdmin,
    materials,
    products,
    directoryProfiles,
    upsertMaterial,
    upsertProduct,
    upsertDirectoryProfile,
    seedStarterCatalogs,
  } = useSensury();

  const [tab, setTab] = useState<'materials' | 'products' | 'directory'>('materials');
  const [seeding, setSeeding] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Material form
  const [matCategory, setMatCategory] = useState<string>(MATERIAL_CATEGORIES[0]);
  const [matName, setMatName] = useState('');
  const [matSummary, setMatSummary] = useState('');
  const [matStandards, setMatStandards] = useState('');
  const [matPrice, setMatPrice] = useState('');
  const [matSource, setMatSource] = useState<SourceAttribution>('Verified Reference');

  // Product form
  const [prodCategory, setProdCategory] = useState<string>(MATERIAL_CATEGORIES[0]);
  const [prodBrand, setProdBrand] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodType, setProdType] = useState('');
  const [prodGrade, setProdGrade] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(0);
  const [prodUnit, setProdUnit] = useState('bag');
  const [prodSource, setProdSource] = useState<SourceAttribution>('Supplier Provided');

  // Directory form
  const [dirRole, setDirRole] = useState<ProfessionalRole>('Civil Engineer');
  const [dirName, setDirName] = useState('');
  const [dirDistrict, setDirDistrict] = useState('Chennai');
  const [dirSpec, setDirSpec] = useState('');

  if (!isAdmin) {
    return (
      <div className="bg-white border border-[#E7E5DF] rounded-xl p-8 max-w-xl">
        <h1 className="font-display text-2xl font-bold text-[#14171A] mb-2">Admin Access Required</h1>
        <p className="text-sm text-[#4A5056]">
          Catalog publishing and directory management are restricted to verified administrators.
        </p>
      </div>
    );
  }

  const handleSeed = async () => {
    setSeeding(true);
    setStatusMsg('');
    try {
      await seedStarterCatalogs();
      setStatusMsg('Starter Tamil Nadu materials, products, and templates published to Firestore.');
    } finally {
      setSeeding(false);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertMaterial({
      id: `mat_${Date.now()}`,
      category: matCategory,
      name: matName,
      summary: matSummary,
      types: 'Standard residential grades',
      applications: 'Residential construction',
      qualitySpecs: 'Verify batch/IS mark before unloading',
      indianStandards: matStandards || 'Refer applicable BIS code',
      pros: 'Suitable when specified by project engineer',
      cons: 'Verify regional availability and storage conditions',
      brandExamples: 'Authorized regional brands',
      indicativePrice: matPrice || 'Request local supplier quote',
      priceLocation: 'Tamil Nadu',
      priceDate: '2026',
      sourceType: matSource,
      manufacturerNotes: 'Request manufacturer batch certificate.',
      supplierNotes: 'Obtain itemized GST invoice.',
    });
    setMatName('');
    setMatSummary('');
    setMatStandards('');
    setMatPrice('');
    setStatusMsg('Material entry saved to Firestore.');
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertProduct({
      id: `prod_${Date.now()}`,
      category: prodCategory,
      brand: prodBrand,
      name: prodName,
      productType: prodType,
      grade: prodGrade,
      specs: 'Published via SENSURY Catalog Admin',
      indicativePriceInr: Number(prodPrice),
      unit: prodUnit,
      priceLocation: 'Tamil Nadu',
      qualityDocsNote: 'Request GST bill & batch test sheet',
      pros: 'Verified catalog entry',
      cons: 'Confirm local freight cost',
      suitableFor: 'Residential homes',
      sourceType: prodSource,
    });
    setProdBrand('');
    setProdName('');
    setProdType('');
    setProdGrade('');
    setProdPrice(0);
    setStatusMsg('Product comparison entry saved to Firestore.');
  };

  const handleAddDir = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertDirectoryProfile({
      id: `dir_${Date.now()}`,
      role: dirRole,
      name: dirName,
      district: dirDistrict,
      specialization: dirSpec,
      experienceNote: 'Listed by SENSURY HOME administrator.',
      verificationLabel: 'Admin Listed',
    });
    setDirName('');
    setDirSpec('');
    setStatusMsg('Directory listing saved to Firestore.');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E7E5DF]">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#14171A]">
            Catalog &amp; Content Admin
          </h1>
          <p className="text-sm text-[#4A5056] mt-1">
            Publish verified material records, product comparison entries, and directory listings to Firestore.
          </p>
        </div>
        <button
          type="button"
          disabled={seeding}
          onClick={handleSeed}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] disabled:opacity-60 cursor-pointer shrink-0"
        >
          <Database className="w-4 h-4" />
          <span>{seeding ? 'Publishing...' : 'Publish Starter Catalogs to Firestore'}</span>
        </button>
      </div>

      {statusMsg && (
        <p className="text-xs text-[#154D34] flex items-center gap-1.5 bg-[#F3F8F5] border border-[#154D34]/20 rounded-lg p-3">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg}</span>
        </p>
      )}

      <div className="flex gap-1 p-1 bg-[#EFECE6] rounded-lg w-fit">
        {([
          { id: 'materials', label: `Materials (${materials.length})` },
          { id: 'products', label: `Products (${products.length})` },
          { id: 'directory', label: `Directory (${directoryProfiles.length})` },
        ] as const).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
              tab === t.id ? 'bg-white text-[#14171A] shadow-sm' : 'text-[#4A5056]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'materials' && (
        <form onSubmit={handleAddMaterial} className="bg-white border border-[#E7E5DF] rounded-xl p-6 max-w-2xl space-y-4">
          <h2 className="font-display text-lg font-semibold text-[#14171A]">Add / Publish Material Entry</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select value={matCategory} onChange={(e) => setMatCategory(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#E7E5DF] rounded-lg">
                {MATERIAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Source Attribution</label>
              <select value={matSource} onChange={(e) => setMatSource(e.target.value as SourceAttribution)} className="w-full px-3 py-2 text-sm border border-[#E7E5DF] rounded-lg">
                <option value="Verified Reference">Verified Reference</option>
                <option value="Manufacturer Claim">Manufacturer Claim</option>
                <option value="Supplier Provided">Supplier Provided</option>
                <option value="Sample Reference">Sample Reference</option>
              </select>
            </div>
          </div>
          <input type="text" required value={matName} onChange={(e) => setMatName(e.target.value)} placeholder="Material Name" className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg" />
          <textarea required rows={3} value={matSummary} onChange={(e) => setMatSummary(e.target.value)} placeholder="Plain-language summary..." className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" value={matStandards} onChange={(e) => setMatStandards(e.target.value)} placeholder="IS Standard (e.g. IS 1489)" className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg" />
            <input type="text" value={matPrice} onChange={(e) => setMatPrice(e.target.value)} placeholder="Indicative Price Range" className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg" />
          </div>
          <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-[#154D34] rounded-lg cursor-pointer">
            Publish Material
          </button>
        </form>
      )}

      {tab === 'products' && (
        <form onSubmit={handleAddProduct} className="bg-white border border-[#E7E5DF] rounded-xl p-6 max-w-2xl space-y-4">
          <h2 className="font-display text-lg font-semibold text-[#14171A]">Add Product Comparison Entry</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#E7E5DF] rounded-lg">
              {MATERIAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={prodSource} onChange={(e) => setProdSource(e.target.value as SourceAttribution)} className="w-full px-3 py-2 text-sm border border-[#E7E5DF] rounded-lg">
              <option value="Verified Reference">Verified Reference</option>
              <option value="Manufacturer Claim">Manufacturer Claim</option>
              <option value="Supplier Provided">Supplier Provided</option>
            </select>
            <input type="text" required value={prodBrand} onChange={(e) => setProdBrand(e.target.value)} placeholder="Brand Name" className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg" />
            <input type="text" required value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="Product Name" className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg" />
            <input type="text" required value={prodType} onChange={(e) => setProdType(e.target.value)} placeholder="Product Type" className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg" />
            <input type="text" required value={prodGrade} onChange={(e) => setProdGrade(e.target.value)} placeholder="Grade / Standard" className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg" />
            <input type="number" required value={prodPrice || ''} onChange={(e) => setProdPrice(Number(e.target.value))} placeholder="Indicative Price INR" className="w-full px-3.5 py-2 text-sm font-mono-num border border-[#E7E5DF] rounded-lg" />
            <input type="text" required value={prodUnit} onChange={(e) => setProdUnit(e.target.value)} placeholder="Unit (bag, kg, sq.ft)" className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg" />
          </div>
          <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-[#154D34] rounded-lg cursor-pointer">
            Publish Product
          </button>
        </form>
      )}

      {tab === 'directory' && (
        <form onSubmit={handleAddDir} className="bg-white border border-[#E7E5DF] rounded-xl p-6 max-w-2xl space-y-4">
          <h2 className="font-display text-lg font-semibold text-[#14171A]">Add Directory Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select value={dirRole} onChange={(e) => setDirRole(e.target.value as ProfessionalRole)} className="w-full px-3 py-2 text-sm border border-[#E7E5DF] rounded-lg">
              <option>Architect</option>
              <option>Civil Engineer</option>
              <option>Structural Engineer</option>
              <option>Contractor</option>
              <option>Interior Designer</option>
              <option>Material Supplier</option>
            </select>
            <input type="text" required value={dirDistrict} onChange={(e) => setDirDistrict(e.target.value)} placeholder="District" className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg" />
          </div>
          <input type="text" required value={dirName} onChange={(e) => setDirName(e.target.value)} placeholder="Professional / Firm Name" className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg" />
          <input type="text" required value={dirSpec} onChange={(e) => setDirSpec(e.target.value)} placeholder="Specialization & Scope" className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg" />
          <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-[#154D34] rounded-lg cursor-pointer">
            Publish Directory Entry
          </button>
        </form>
      )}
    </div>
  );
}
