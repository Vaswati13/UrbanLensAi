import React, { useState } from 'react';

const Slider = ({ beforeImage, afterImage }) => {
  const [sliderPos, setSliderPos] = useState(50);

  const handleSliderChange = (e) => {
    setSliderPos(e.target.value);
  };

  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg select-none">
      {/* Before Image (Background) */}
      <img
        src={beforeImage}
        alt="Before satellite"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-700">
        Raw Satellite Imagery (Before)
      </div>

      {/* After Image (Overlay clipped by slider position) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
      >
        <img
          src={afterImage}
          alt="After satellite detection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-sky-500/95 backdrop-blur text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-sky-400">
          AI Feature Mapping Overlay (After)
        </div>
      </div>

      {/* Slider Controls Container */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
        {/* Visual Line separator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20"
          style={{ left: `${sliderPos}%` }}
        />

        {/* Grab Handle */}
        <div
          className="absolute w-8 h-8 bg-white dark:bg-slate-800 text-sky-500 dark:text-sky-400 rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-700 cursor-ew-resize z-30 pointer-events-none"
          style={{ left: `calc(${sliderPos}% - 16px)` }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
            />
          </svg>
        </div>

        {/* Real Transparent Slider Input Layer */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={handleSliderChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize pointer-events-auto z-40"
        />
      </div>
    </div>
  );
};

export default Slider;
