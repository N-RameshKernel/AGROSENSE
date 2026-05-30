import React, { useState } from "react";

const REGION_DATA: Record<string, string[]> = {
  "Andhra Pradesh": ["Guntur", "Krishna", "West Godavari", "Kurnool", "Kadapa"],
  "Tamil Nadu": ["Coimbatore", "Thanjavur", "Madurai", "Salem", "Tirunelveli"],
  Karnataka: ["Dharwad", "Haveri", "Tumkur", "Mysuru", "Raichur"],
  Maharashtra: ["Nashik", "Pune", "Aurangabad", "Amravati", "Solapur"],
  Punjab: ["Ludhiana", "Amritsar", "Patiala", "Jalandhar", "Bhatinda"],
};

const CROPS = [
  "Chilli",
  "Cotton",
  "Paddy",
  "Wheat",
  "Tomato",
  "Sugarcane",
  "Groundnut",
];

interface RegionSelectorProps {
  onSelect: (state: string, district: string, crop: string) => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({ onSelect }) => {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [crop, setCrop] = useState("");

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(e.target.value);
    setDistrict("");
  };

  const handleSubmit = () => {
    if (state && district && crop) onSelect(state, district, crop);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* State */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          State
        </label>
        <select
          value={state}
          onChange={handleStateChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Select state…</option>
          {Object.keys(REGION_DATA).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* District */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          District
        </label>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          disabled={!state}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 disabled:opacity-40"
        >
          <option value="">Select district…</option>
          {state &&
            REGION_DATA[state].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
        </select>
      </div>

      {/* Crop */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          Crop
        </label>
        <select
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select crop…</option>
          {CROPS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!state || !district || !crop}
        className="w-full py-2.5 bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-green-800 transition-colors"
      >
        Get Advice →
      </button>
    </div>
  );
};

export default RegionSelector;
