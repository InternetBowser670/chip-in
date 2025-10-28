import clsx from "clsx";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

interface CustomCardProps extends CardProps {
  chin?: boolean;
}

export default function Card({
  children,
  className = "",
  color = "green",
  chin = false,
  ...rest
}: CustomCardProps) {
  return (
    <div
      className={clsx(
        `p-[20px]! rounded-2xl border-2 backdrop-blur-md backdrop-filter backdrop-opacity-50 transition-all ${className}`,
        chin && "border-b-6 cursor-pointer",
        color == "green"
          ? "border-primary-400 bg-primary-900 hover:bg-primary-800"
          : color == "blue"
          ? "border-accent-400 bg-accent-900 hover:bg-accent-800"
          : color == "red"
          ? "border-red-500 bg-red-900 hover:bg-red-800"
          : color == "purple"
          ? "border-purple-400 bg-purple-900 hover:bg-purple-800"
          : color == "orange"
          ? "border-orange-400 bg-orange-900 hover:bg-orange-800"
          : color == "yellow"
          ? "border-yellow-400 bg-yellow-900 hover:bg-yellow-800"
          : "border-primary-400 bg-primary-900 hover:bg-primary-800"
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
