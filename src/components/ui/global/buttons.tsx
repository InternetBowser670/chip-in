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
        "p-1 m-2 text-sm font-medium transition-all border-2 border-b-4 cursor-pointer rounded-2xl bg-accent-400 text-gray-950 sm:text-base sm:px-5 border-accent-600 hover:bg-accent-500 hover:border-accent-700",
        disabled && "opacity-50 cursor-not-allowed",
        className,
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
        "p-1 m-2 text-sm font-medium transition-all border-2 border-b-4 cursor-pointer rounded-2xl bg-accent-400 text-gray-950 sm:text-base sm:px-5 border-accent-600 hover:bg-accent-500 hover:border-accent-700",
        disabled && "opacity-50 cursor-not-allowed",
        className,
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
        "p-1 m-2 text-sm font-medium transition-all border-2 border-b-4 cursor-pointer rounded-2xl bg-secondary-500 text-gray-950 sm:text-base sm:px-5 border-secondary-600 hover:bg-secondary-600 hover:border-secondary-700",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      onClick={onClick}
    >
      {Icon && <Icon width={24} />} {text}
    </button>
  );
}