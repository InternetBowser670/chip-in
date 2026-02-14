/* eslint-disable @next/next/no-img-element */
"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ChatMessage({ msg }: any) {
  return (
    <>
      <div className="flex gap-2 p-2">
        {msg.displayType == "systemDefault" ? (
          <div className="w-full px-2 py-2 border-l-2 bg-foreground/5 border-l-foreground/20">
            <p className="font-bold">{msg.text}</p>
            <p className="text-foreground/75">
              {(() => {
                const messageDate = new Date(msg.timestamp);
                const today = new Date();

                const isToday =
                  messageDate.toDateString() === today.toDateString();

                return isToday
                  ? messageDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : messageDate.toLocaleString();
              })()}
            </p>
          </div>
        ) : msg.displayType == "chatMessage" ? (
          <>
            {msg.imageUrl ? (
              <>
                <div className="flex max-w-[calc(100%-16px)] gap-2 p-2 text-sm">
                  <img
                    className="rounded-full size-10"
                    alt={msg.username}
                    src={msg.imageUrl}
                  />
                  <div className="max-w-[calc(100%-48px)] p-0">
                    <div className="flex gap-1">
                      <p className="font-bold">{msg.username}</p>
                      <p className="text-foreground/75">
                        {(() => {
                          const messageDate = new Date(msg.timestamp);
                          const today = new Date();

                          const isToday =
                            messageDate.toDateString() === today.toDateString();

                          return isToday
                            ? messageDate.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : messageDate.toLocaleString();
                        })()}
                      </p>
                    </div>
                    <p className="max-w-full text-wrap wrap-break-word">
                      {msg.text}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="font-bold">{msg.username}: </p>
                <p>{msg.text}</p>
              </>
            )}
          </>
        ) : (
          <>
            <div className="flex gap-1">
              <p className="font-bold">{msg.username}</p>
              <p className="text-foreground/75">
                {(() => {
                  const messageDate = new Date(msg.timestamp);
                  const today = new Date();

                  const isToday =
                    messageDate.toDateString() === today.toDateString();

                  return isToday
                    ? messageDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : messageDate.toLocaleString();
                })()}
              </p>
            </div>
            <p>{msg.text}</p>
          </>
        )}
      </div>
    </>
  );
}
