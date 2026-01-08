import clsx from "clsx";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

interface CustomCardProps extends CardProps {
  chin?: boolean;
  noHover?: boolean;
}

export default function Card({
  children,
  className = "",
  color = "green",
  chin = false,
  noHover = false,
  ...rest
}: CustomCardProps) {
  return (
    <div
      className={clsx(
        `p-5! rounded-2xl border-2 backdrop-blur-md backdrop-filter backdrop-opacity-50 transition-all ${className}`,
        chin && "border-b-6 cursor-pointer",
        color == "green"
          ? `border-primary-400 bg-primary-900 ${
              noHover ? "" : "hover:bg-primary-800"
            }`
          : color == "blue"
          ? `border-accent-400 bg-accent-900 ${
              noHover ? "" : "hover:bg-accent-800"
            }`
          : color == "red"
          ? `border-red-500 bg-red-900 ${noHover ? "" : "hover:bg-red-800"}`
          : color == "purple"
          ? `border-purple-400 bg-purple-900 ${
              noHover ? "" : "hover:bg-purple-800"
            }`
          : color == "orange"
          ? `border-orange-400 bg-orange-900 ${
              noHover ? "" : "hover:bg-orange-800"
            }`
          : color == "yellow"
          ? `border-yellow-400 bg-yellow-900 ${
              noHover ? "" : "hover:bg-yellow-800"
            }`
          : color == "grayscale"
          ? `border-gray-400 bg-gray-900 ${noHover ? "" : "hover:bg-gray-800"}`
          : `border-primary-400 bg-primary-900 ${
              noHover ? "" : "hover:bg-primary-800"
            }`
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
