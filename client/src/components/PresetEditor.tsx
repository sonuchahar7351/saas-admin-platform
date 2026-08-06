"use client";

interface Preset {
  value: number;
  isDefault: boolean;
}

export function PresetEditor({
  label,
  presets,
  onChange,
  unit,
}: {
  label: string;
  presets: Preset[];
  onChange: (presets: Preset[]) => void;
  unit: string; // "₹" or "%"
}) {
  const updateValue = (index: number, value: number) => {
    const next = [...presets];
    next[index] = { ...next[index], value };
    onChange(next);
  };

  const setDefault = (index: number) => {
    onChange(presets.map((p, i) => ({ ...p, isDefault: i === index })));
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <p className="mb-2 text-xs text-text-secondary">
        Set 3 values. Select one as the default.
      </p>
      <div className="flex gap-3">
        {presets.map((preset, i) => (
          <div
            key={i}
            className={`flex-1 rounded-lg border p-3 ${
              preset.isDefault ? "border-accent bg-accent/5" : "border-border"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-text-secondary">{unit}</span>
              <input
                type="number"
                value={preset.value}
                onChange={(e) => updateValue(i, Number(e.target.value))}
                className="w-full bg-transparent text-sm font-medium outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setDefault(i)}
              className={`mt-2 w-full rounded-md py-1 text-xs font-medium transition-colors ${
                preset.isDefault
                  ? "bg-accent text-white"
                  : "border border-border text-text-secondary hover:bg-bg"
              }`}
            >
              {preset.isDefault ? "Default" : "Set default"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
