"use client";

import { ClerkLoaded, ClerkLoading, useUser } from "@clerk/nextjs";
import { RiExpandUpDownLine } from "react-icons/ri";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { FaRegUser } from "react-icons/fa";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TbGift } from "react-icons/tb";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { useState } from "react";
import { useChips } from "../providers";
import { SignOutButton } from "@clerk/nextjs";

export default function UserOptions() {
  const { user } = useUser();

  const router = useRouter();

  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const { setChips } = useChips();

  async function redeemPromoCode() {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    setRedeeming(true);
    setPromoError(null);

    try {
      const res = await fetch("/api/promo-codes/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPromoError(data?.message ?? "Failed to redeem promo code");
        return;
      }

      setPromoCode("");
      setChips(data.newBalance);
      setPromoSuccess("Promo code redeemed successfully!");
      router.refresh();
    } catch {
      setPromoError("Network error. Try again.");
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <>
      <ClerkLoading>Loading...</ClerkLoading>
      <ClerkLoaded>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="flex justify-between w-[calc(100%-16px)] gap-4 p-4 py-6 overflow-hidden"
            >
              <Avatar>
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback />
              </Avatar>
              <div className="relative flex-1 overflow-hidden">
                <div className="whitespace-nowrap mask-[linear-gradient(to_right,black_80%,transparent_100%)]">
                  {user?.username || user?.primaryEmailAddress?.emailAddress}
                </div>
              </div>
              <RiExpandUpDownLine />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-4 ml-2 w-80">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback />
              </Avatar>
              <div className="relative flex-1 overflow-hidden">
                <div className="whitespace-nowrap mask-[linear-gradient(to_right,black_80%,transparent_100%)]">
                  {user?.username || user?.primaryEmailAddress?.emailAddress}
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-1">
              <Button
                onClick={() => router.push("/profile")}
                variant={"ghost"}
                className="justify-start w-full gap-4"
              >
                <FaRegUser />
                Profile
              </Button>
              <Dialog>
                <DialogTrigger className="w-full">
                  <div className="inline-flex whitespace-nowrap rounded-md text-sm transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 px-4 py-2 has-[>svg]:px-3 items-center justify-start w-full gap-4 p-2 font-medium hover:text-accent-foreground hover:bg-accent dark:hover:bg-accent/50">
                    <TbGift />
                    Promo Code
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      <div className="flex gap-2">
                        <TbGift /> Promo Code
                      </div>
                    </DialogTitle>
                    <DialogDescription>
                      Enter a promo code below for a reward.
                    </DialogDescription>
                    <Field>
                      <FieldLabel>Promo Code</FieldLabel>
                      <Input
                        placeholder="Code..."
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={redeeming}
                      />

                      {promoError && (
                        <Alert variant="destructive" className="max-w-md">
                          <AlertCircleIcon />
                          <AlertTitle>{promoError}</AlertTitle>
                        </Alert>
                      )}
                      {promoSuccess && (
                        <Alert className="max-w-md">
                          <TbGift className="w-4 h-4" />
                          <AlertTitle>{promoSuccess}</AlertTitle>
                        </Alert>
                      )}
                    </Field>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={redeemPromoCode} disabled={redeeming}>
                      {redeeming ? "Redeeming..." : "Redeem Code"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Separator />
              <SignOutButton>
                <Button
                  onClick={() => router.push("/profile")}
                  variant={"destructive"}
                  className="justify-start w-full gap-4 bg-transparent! hover:bg-destructive/20!"
                >
                  <FaRegUser />
                  Sign out
                </Button>
              </SignOutButton>
          </PopoverContent>
        </Popover>
      </ClerkLoaded>
    </>
  );
}
