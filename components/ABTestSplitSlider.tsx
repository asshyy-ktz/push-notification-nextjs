"use client";

interface ABTestSplitSliderProps {
  splitA: number;
  onChange: (splitA: number) => void;
  labelA?: string;
  labelB?: string;
}

export function ABTestSplitSlider({
  splitA,
  onChange,
  labelA = "Variant A",
  labelB = "Variant B",
}: ABTestSplitSliderProps) {
  const splitB = 100 - splitA;

  return (
    <div>
      <div className="flex items-center justify-between text-sm font-medium mb-2">
        <span className="text-brand-700">
          {labelA}: {splitA}%
        </span>
        <span className="text-purple-700">
          {labelB}: {splitB}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={splitA}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-brand-600 cursor-pointer"
        aria-label="Traffic split between variant A and variant B"
      />
      <div className="mt-2 h-2 w-full rounded-full overflow-hidden flex">
        <div className="bg-brand-500" style={{ width: `${splitA}%` }} />
        <div className="bg-purple-500" style={{ width: `${splitB}%` }} />
      </div>
    </div>
  );
}
