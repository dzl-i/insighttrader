"use client";

import { ChevronDown } from "lucide-react";
import { ReactNode, useState } from "react";
// import "./Dropdown.css"; // Make sure to create this CSS file

export default function Dropdown({
  heading,
  initialState,
  children,
}: {
  heading: string;
  initialState?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(initialState ? initialState : false);

  return (
    <div>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between border border-white/10 bg-white/5 p-4 font-bold ${open ? "rounded-bl-none rounded-br-none rounded-tl-lg rounded-tr-lg" : "rounded-lg"}`}
      >
        {heading}
        <ChevronDown className={`h-6 w-6 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`transition-height duration-500 ease-in-out overflow-auto ${open ? "max-h-96" : "max-h-0"}`} style={{ willChange: 'max-height' }}>
        <div className="w-full rounded-bl-lg rounded-br-lg border border-white/10 border-t-transparent bg-white/5 p-4">
          {children}
        </div>
      </div>
    </div>
  );
}