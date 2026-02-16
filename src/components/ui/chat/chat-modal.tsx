import { useEffect, useState, useRef } from "react";
import FloatingWindow from "../global/floating-window";
import { Button } from "../button";
import { useLiveChat, useLiveUsers } from "@/components/providers";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "../input-group";
import { IoArrowUpOutline } from "react-icons/io5";
import { useUser } from "@clerk/nextjs";
import ChatMessage from "./chatMessages";
import Ping from "../global/ping";

export default function ChatModal() {
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  const { chat } = useLiveUsers();

  const { messages, sendMessage, join, leave, isInChat, ping, messagePing } = useLiveChat(chatOpen);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const messageValid = message !== "";

  const user = useUser().user;

  useEffect(() => {
    if (chatOpen == false && isInChat) {
      leave();
    } else {
      join();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen]);

  function handleSubmit() {
    if (messageValid) {
      sendMessage(message);
      setMessage("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSubmit();
    }
  }

  return (
    <>
      <Button
        disabled={!user}
        onClick={() => setChatOpen(!chatOpen)}
        variant={"outline"}
        className="relative"
      >
        {chatOpen ? "Close chat" : "Open chat"}
        {messagePing && <Ping size={3} className="absolute! -right-1.5 -top-1.5" />}
      </Button>
      {chatOpen && (
        <FloatingWindow
          onClose={() => setChatOpen(false)}
          titleElement={
            <div>
              <h2 className="text-xl font-semibold">Live Chat</h2>
              <span className="flex items-center gap-2">
                <Ping color="blue" />
                Users online: {chat}
              </span>
            </div>
          }
        >
          <div className="flex flex-col flex-1 max-h-full overflow-hidden">
            <div
              ref={scrollRef}
              className="flex-1 max-w-full pr-2 space-y-2 overflow-y-auto"
            >
              {messages.map((msg, i) => (
                <ChatMessage key={i} msg={msg} />
              ))}
            </div>

            <div className="flex flex-col gap-2 p-2">
              <InputGroup>
                <InputGroupInput
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                />
                <InputGroupAddon align={"inline-end"}>
                  <InputGroupButton
                    onClick={handleSubmit}
                    disabled={!messageValid}
                    variant={"outline"}
                  >
                    <IoArrowUpOutline />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <span className="flex items-center gap-2">
                <Ping color="green" size={2} />
                Ping: {ping}
              </span>
            </div>
          </div>
        </FloatingWindow>
      )}
    </>
  );
}
