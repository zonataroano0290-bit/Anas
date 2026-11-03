import React, { useState } from 'react';
import { useLocalization } from '../../locales/index.tsx';
import { Users2, MapPin, Globe2, BarChart2, CheckSquare, Square } from 'lucide-react';
import { IRAQI_GOVERNORATES } from '../../utils/rules.ts';

export const AudienceView: React.FC = () => {
  const { t } = useLocalization();
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedCodes, setSelectedCodes] = useState<string[]>([
    'IQ-ER',
    'IQ-SU',
    'IQ-DH',
    'IQ-HL',
    'IQ-BG',
  ]);

  const regions = ['All', 'Kurdistan', 'Central', 'Southern', 'Northern', 'Western'];

  const filtered =
    selectedRegion === 'All'
      ? IRAQI_GOVERNORATES
      : IRAQI_GOVERNORATES.filter((g) => g.region === selectedRegion);

  const totalAudienceSize = IRAQI_GOVERNORATES.filter((g) =>
    selectedCodes.includes(g.code)
  ).reduce((acc, curr) => acc + curr.estimatedAudienceSize, 0);

  const toggleSelect = (code: string) => {
    if (selectedCodes.includes(code)) {
      setSelectedCodes(selectedCodes.filter((c) => c !== code));
    } else {
      setSelectedCodes([...selectedCodes, code]);
    }
  };

  const selectAllFiltered = () => {
    const codesToAdd = filtered.map((g) => g.code);
    const combined = Array.from(new Set([...selectedCodes, ...codesToAdd]));
    setSelectedCodes(combined);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t.audience.title}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.audience.subtitle}</p>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
          <Users2 className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-400">{t.audience.estimatedTotalAudience}</div>
            <div className="text-base font-bold text-white font-mono tabular-nums">
              ~ {totalAudienceSize.toLocaleString()} users
            </div>
          </div>
        </div>
      </div>

      {/* Regional Segmented Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {regions.map((reg) => (
          <button
            key={reg}
            onClick={() => setSelectedRegion(reg)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedRegion === reg
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {reg === 'All' ? t.common.all : reg}
          </button>
        ))}

        <button
          onClick={selectAllFiltered}
          className="ms-auto text-xs text-cyan-400 hover:underline font-medium"
        >
          Select All in View
        </button>
      </div>

      {/* Iraqi Governorates Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 text-start w-12">Select</th>
                <th className="py-3 px-4 text-start">Governorate (Kurdish / Arabic)</th>
                <th className="py-3 px-4 text-start">English Name</th>
                <th className="py-3 px-4 text-start">Region</th>
                <th className="py-3 px-4 text-end">Est. Digital Audience</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((gov) => {
                const isSelected = selectedCodes.includes(gov.code);
                return (
                  <tr
                    key={gov.code}
                    onClick={() => toggleSelect(gov.code)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="accent-cyan-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      <span>{gov.nameCkb}</span>
                      <span className="text-slate-500 mx-2">/</span>
                      <span className="text-slate-300">{gov.nameAr}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{gov.nameEn}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-medium ${
                          gov.region === 'Kurdistan' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {gov.region}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end font-mono tabular-nums text-slate-200">
                      {gov.estimatedAudienceSize.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
