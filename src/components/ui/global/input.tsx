// from pzn - may not use

import React from "react";
import { v4 } from "uuid";

type CustomCheckboxProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  className?: string;
};

const Checkbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  label,
  className,
}) => {
  return (
    <label
      className={`flex items-center gap-2 text-lg cursor-pointer select-none w-fit border-2 border-[#0096FF] rounded-2xl p-3! ${className}`}
    >
      {label && <span className="font-semibold">{label}</span>}
      <span className="relative flex items-center justify-center">
        <input
          id={v4()}
          name={v4()}
          type="checkbox"
          className="absolute w-0 h-0 opacity-0 peer"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <span className="block w-6 h-6 transition-colors bg-black border-2 border-white rounded-sm hover:bg-[#091d36] peer-checked:bg-[#091d36] duration-300" />
        <svg
          className={`absolute top-0.5 left-0.5 w-5 h-5 text-white pointer-events-none transition-opacity ${
            checked ? "opacity-100" : "opacity-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </span>
    </label>
  );
};

export { Checkbox };

type CustomTextboxProps = {
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
};

export function TextInput({
  value,
  onChange,
  className,
  placeholder
}: CustomTextboxProps) {
  return (
    <input
      onChange={(e) => onChange?.(e.target.value)}
      className={`px-2! py-1! bg-black border-2 border-white rounded-2xl transition-colors duration-500 mx-2! ${className}`}
      placeholder={placeholder}
      value={value}
      name=""
      id=""
    />
  );
}