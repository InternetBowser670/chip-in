export default function Ping({ size = 2 }: { size?: number }) {
  return (
    <>
      <span className={`relative flex size-${size}`}>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
        <span className={`relative inline-flex size-${size} rounded-full bg-sky-500`}></span>
      </span>
    </>
  );
}
