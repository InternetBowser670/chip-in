"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ChatMessage({ msg }: any) {
  return (
    <>
      <div className="flex gap-2 p-2">
        {msg.displayType == "systemDefault" ? (
          <div className="w-full px-2 py-2 border-l-2 bg-foreground/5 border-l-foreground/20">
            {msg.text}
          </div>
        ) : msg.displayType == "chatMessage" ? (
          <>
            <p className="font-bold">{msg.username}: </p>
            <p>{msg.text}</p>
          </>
        ) : (
          <>
            <p className="font-bold">{msg.username}: </p>
            <p>{msg.text}</p>
          </>
        )}
      </div>
    </>
  );
}
