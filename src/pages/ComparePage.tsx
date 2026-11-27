import React, { useMemo, useState } from 'react';
import { useSensury } from '../context/SensuryContext';
import { formatInr } from '../lib/calculators';

export function ComparePage() {
  const { products } = useSensury();
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>(
    products.slice(0, 2).map((p) => p.id)
  );

  const visibleProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const comparedProducts = products.filter((p) => selectedIds.includes(p.id));

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((x) => x !== id) : prev;
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-[#E7E5DF]">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#14171A]">
          Product Comparison
        </h1>
        <p className="text-sm text-[#4A5056] mt-1 max-w-2xl">
          Select up to 3 construction products to compare brand type, grade, specifications,
          indicative pricing, quality documentation, and suitable residential uses side by side.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#154D34] text-white border-[#154D34]'
                : 'bg-white text-[#4A5056] border-[#E7E5DF] hover:text-[#14171A]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Selector Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleProducts.map((prod) => {
          const checked = selectedIds.includes(prod.id);
          return (
            <button
              key={prod.id}
              type="button"
              onClick={() => toggleProduct(prod.id)}
              className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                checked
                  ? 'bg-[#F3F8F5] border-[#154D34]'
                  : 'bg-white border-[#E7E5DF] hover:bg-[#F9F8F6]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs text-[#4A5056] mb-1">
                <span>{prod.category} · {prod.grade}</span>
                <span className="font-semibold text-[#154D34]">
                  {checked ? 'Selected' : 'Select'}
                </span>
              </div>
              <p className="font-display text-base font-semibold text-[#14171A]">{prod.name}</p>
              <p className="text-xs text-[#4A5056] mt-1">
                {prod.brand} · <span className="font-mono-num">{formatInr(prod.indicativePriceInr)}/{prod.unit}</span>
              </p>
            </button>
          );
        })}
      </div>

      {/* Comparison Matrix */}
      {comparedProducts.length > 0 && (
        <div className="bg-white border border-[#E7E5DF] rounded-xl overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-[#E7E5DF] bg-[#F9F8F6]">
                <th className="p-4 text-xs font-semibold text-[#4A5056] w-44">Attribute</th>
                {comparedProducts.map((p) => (
                  <th key={p.id} className="p-4 font-display text-base font-semibold text-[#14171A]">
                    {p.name}
                    <span className="block text-xs font-normal text-[#4A5056] mt-0.5">
                      {p.sourceType}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5DF]">
              <tr>
                <td className="p-4 text-xs font-semibold text-[#4A5056]">Brand / Supply Tier</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-[#14171A]">{p.brand}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-xs font-semibold text-[#4A5056]">Product Type</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-[#14171A]">{p.productType}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-xs font-semibold text-[#4A5056]">Grade / Standard</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 font-medium text-[#154D34]">{p.grade}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-xs font-semibold text-[#4A5056]">Indicative Price</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 font-mono-num font-semibold text-[#14171A]">
                    {formatInr(p.indicativePriceInr)} / {p.unit}
                    <span className="block text-xs font-sans font-normal text-[#4A5056]">
                      {p.priceLocation}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-xs font-semibold text-[#4A5056]">Key Specifications</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-[#4A5056] leading-relaxed">{p.specs}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-xs font-semibold text-[#4A5056]">Quality Documentation</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-[#4A5056] leading-relaxed">{p.qualityDocsNote}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-xs font-semibold text-[#4A5056]">Advantages</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-[#154D34] leading-relaxed">{p.pros}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-xs font-semibold text-[#4A5056]">Disadvantages / Trade-offs</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-[#4A5056] leading-relaxed">{p.cons}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-xs font-semibold text-[#4A5056]">Suitable Applications</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-[#14171A] leading-relaxed">{p.suitableFor}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
