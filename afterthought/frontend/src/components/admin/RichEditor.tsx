"use client";
import React from 'react';

// A mock up component of the Notion-like rich editor requested by the user, for demonstration purposes.
export const RichEditor = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  return (
    <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50 min-h-[500px]">
      <div className="flex space-x-2 border-b border-zinc-800 pb-2 mb-4">
        <button className="text-zinc-400 hover:text-white font-mono text-sm px-2">B</button>
        <button className="text-zinc-400 hover:text-white font-mono text-sm px-2">I</button>
        <button className="text-zinc-400 hover:text-white font-mono text-sm px-2">H1</button>
        <button className="text-zinc-400 hover:text-white font-mono text-sm px-2">H2</button>
        <button className="text-zinc-400 hover:text-white font-mono text-sm px-2">Quote</button>
      </div>
      <textarea
        className="w-full bg-transparent focus:outline-none text-zinc-300 font-sans leading-relaxed min-h-[400px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start writing..."
      />
    </div>
  );
};
