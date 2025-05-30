import React, { useEffect, useRef, useState, ReactNode } from "react";

interface DropdownProps {
  label: ReactNode;
  children: ReactNode;
}

const ReusableDropdown: React.FC<DropdownProps> = ({ label, children }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-zinc-700"
      >
        {label}
      </button>
      {open && (
        <div className="absolute right-0 bg-white dark:bg-zinc-800 shadow-lg min-w-[160px] z-10 mt-1 rounded">
          {children}
        </div>
      )}
    </div>
  );
};

export default ReusableDropdown;
