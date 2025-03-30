import React from "react";

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({
  text,
  children,
}) => (
  <div className="group relative w-fit">
    {children}
    <div className="absolute z-10 hidden group-hover:flex bg-gray-700 text-white text-xs rounded py-1 px-2 bottom-full mb-2 left-1/2 -translate-x-1/2">
      {text}
    </div>
  </div>
);

export default Tooltip;
