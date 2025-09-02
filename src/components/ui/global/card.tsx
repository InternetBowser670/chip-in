import React from "react";
import clsx from "clsx";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export default function Card({
  children,
  className = "",
  color = "green",
  ...rest
}: CardProps) {
  return (
    <div
      className={clsx(
        `p-[20px]! rounded-[12px] border-2 backdrop-blur-md backdrop-filter backdrop-opacity-50 ${className}`,
        color == "green"
          ? "border-primary-400 bg-primary-900"
          : color == "blue"
          ? "border-accent-400 bg-accent-900"
          : color == "red"
          ? "border-red-500 bg-red-900"
          : color == "purple"
          ? "border-purple-400 bg-purple-900"
          : color == "orange"
          ? "border-orange-400 bg-orange-900"
          : color == "yellow"
          ? "border-yellow-400 bg-yellow-900"
          : "border-primary-400 bg-primary-900"
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
