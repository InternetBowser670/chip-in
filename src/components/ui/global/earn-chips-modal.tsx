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
import { Button } from "../button";
import DailySpin from "./daily-chips";
import { Separator } from "../separator";

export default function EarnChipsModal() {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button>Earn Chips</Button>
        </DialogTrigger>
        <DialogContent className="w-fit!">
          <DialogHeader>
            <DialogTitle>Earn Chips</DialogTitle>
            <DialogDescription>
              Claim your daily free chips and watch ads to earn more chips for
              free!
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <h1 className="text-lg font-semibold">Daily Chips</h1>
          <DailySpin />
          <Separator />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
