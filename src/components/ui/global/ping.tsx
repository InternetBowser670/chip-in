import clsx from "clsx"

export default function Ping({ size = 2, color = "blue" }: { size?: number, color?: string }) {
  return (
    <>
      <span className={`relative flex size-${size}`}>
        <span className={clsx("absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping", color == "green" ? "bg-green-400" : "bg-sky-400")}></span>
        <span className={clsx(`relative inline-flex size-${size} rounded-full`, color == "green" ? "bg-green-500" : "bg-sky-500")}></span>
      </span>
    </>
  );
}
