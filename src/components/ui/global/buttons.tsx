// from pzn

import { clsx } from "clsx";
import { MouseEventHandler } from "react";

export interface ButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  text?: string;
  className?: string;
  disabled?: boolean;
}

export interface ChildrenButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function PrimaryButton({
  onClick,
  Icon,
  text,
  className,
  disabled,
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={clsx(
        "p-1 m-2 text-sm font-medium transition-all border-2 border-b-4 cursor-pointer rounded-2xl bg-accent-900 sm:text-base sm:px-5 border-accent-400",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick}
    >
      {Icon && <Icon width={24} />} {text}
    </button>
  );
}

export function PrimaryButtonChildren({
  children,
  onClick,
  className,
  disabled,
}: ChildrenButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={clsx(
        "p-1 m-2 text-sm font-medium transition-all border-2 border-b-4 cursor-pointer rounded-2xl bg-accent-900 sm:text-base sm:px-5 border-accent-400 hover:bg-accent-800",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  onClick,
  Icon,
  text,
  className,
  disabled,
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={clsx(
        "px-3! py-2! bg-[#134080] border-2 border-white rounded-2xl duration-300 hover:bg-[#113a73] flex items-center justify-center gap-2",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick}
    >
      {Icon && <Icon width={24} />} {text}
    </button>
  );
}

export function SecondaryButtonChildren({
  children,
  onClick,
  className,
  disabled,
}: ChildrenButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={clsx(
        "px-3! py-2! bg-[#134080] border-2 border-white rounded-2xl duration-300 hover:bg-[#113a73] flex items-center justify-center gap-2",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
