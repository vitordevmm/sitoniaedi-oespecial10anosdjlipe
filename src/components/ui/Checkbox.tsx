"use client";

import React, { forwardRef } from "react";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
}

const sizeClasses = {
  sm: {
    box: "w-4 h-4 rounded-[5px]",
    icon: "w-2.5 h-2.5 stroke-[3]",
  },
  md: {
    box: "w-5 h-5 rounded-[6px]",
    icon: "w-3.5 h-3.5 stroke-[3]",
  },
  lg: {
    box: "w-6 h-6 rounded-lg",
    icon: "w-4 h-4 stroke-[3]",
  },
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked = false,
      onCheckedChange,
      onChange,
      disabled = false,
      size = "md",
      className = "",
      label,
      description,
      id,
      ...props
    },
    ref
  ) => {
    const sizeConfig = sizeClasses[size] || sizeClasses.md;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      onCheckedChange?.(e.target.checked);
      onChange?.(e);
    };

    const checkboxElement = (
      <div className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}>
        {/* Real hidden input for accessibility, form submission, and tab focus */}
        <input
          ref={ref}
          type="checkbox"
          id={id}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          className="peer sr-only"
          {...props}
        />

        {/* Custom Visual Box */}
        <div
          className={`
            ${sizeConfig.box}
            flex items-center justify-center transition-all duration-200 ease-out cursor-pointer
            border
            ${
              checked
                ? "bg-gradient-to-br from-[#c9a227] via-[#e2bd44] to-[#f5e6b8] border-[#f5e6b8] shadow-[0_0_12px_rgba(201,162,39,0.45)] scale-100"
                : "bg-[#101116] border-[#0b1930] hover:border-[#c9a227]/70 hover:shadow-[0_0_8px_rgba(201,162,39,0.18)]"
            }
            ${
              disabled
                ? "opacity-40 cursor-not-allowed hover:border-[#0b1930] hover:shadow-none"
                : "active:scale-90"
            }
            peer-focus-visible:ring-2 peer-focus-visible:ring-[#c9a227] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#07090d]
          `}
        >
          {/* Checkmark with micro-animation */}
          <Check
            className={`
              ${sizeConfig.icon}
              text-[#07090d]
              transition-all duration-200 ease-out
              ${checked ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"}
            `}
          />
        </div>
      </div>
    );

    if (!label && !description) {
      return checkboxElement;
    }

    return (
      <label
        htmlFor={id}
        className={`flex items-start gap-2.5 cursor-pointer select-none group ${
          disabled ? "opacity-40 cursor-not-allowed" : ""
        }`}
      >
        <div className="pt-0.5">{checkboxElement}</div>
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-[#f6f8fc] group-hover:text-white transition-colors">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-[#a8b2c3] leading-relaxed">
              {description}
            </span>
          )}
        </div>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
