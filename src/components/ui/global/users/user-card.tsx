import { Avatar, AvatarFallback, AvatarImage } from "../../avatar";
import { Card } from "../../card";
import { useUser } from "@clerk/nextjs";

export default function UserCard() {
  const { user } = useUser();
  return (
    <>
      <Card className="p-4">
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
      </Card>
    </>
  );
}
