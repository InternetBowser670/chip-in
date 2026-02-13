"use client";

import { ReactNode, useRef } from "react";
import { Button } from "../button";
import Draggable from "react-draggable";
import { Card } from "../card";
import { IoClose } from "react-icons/io5";

export default function FloatingWindow ({
  children,
  titleElement,
  onClose
}: {
  children: ReactNode;
  titleElement: ReactNode;
  onClose: () => void;
}) {
  const nodeRef = useRef(null);

  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle">
      <div 
        ref={nodeRef} 
        className="fixed z-50 flex flex-col top-20 left-20"
      >
        <Card className="flex flex-col p-4 overflow-hidden shadow-2xl resize min-w-75 min-h-60 h-125 w-96">
          <div className="flex items-center justify-between pb-2 mb-2 border-b cursor-move select-none drag-handle">
            {titleElement}
            <Button onClick={onClose} variant="ghost" size="icon">
              <IoClose />
            </Button>
          </div>
          <div className="flex flex-col flex-1 w-full min-h-0">
            {children}
          </div>
        </Card>
      </div>
    </Draggable>
  );
};