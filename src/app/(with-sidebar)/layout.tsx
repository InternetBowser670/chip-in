import Image from "next/image";
import Link from "next/link";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex h-screen!">
        <div className="w-40 h-full! bg-background-700">
          <div className="flex justify-center">
            <Link href={'/'} className="flex justify-center">
              <Image
                src={"/chip-in-logo.png"}
                width={50}
                height={50}
                alt="Chip In logo"
              />
              <p className="flex items-center text-lg!">ChipIn</p>
            </Link>
          </div>
        </div>
        <div className="w-full h-full rounded-2xl">{children}</div>
      </div>
    </>
  );
}
