"use client";
import React, { useState } from "react";
import useInitializeChatClient from "./useInitializeChatClient";
import { Loader2 } from "lucide-react";
import { Chat as StreamChat } from "stream-chat-react";
import ChatSidebar from "./ChatSidebar";
import ChatChannel from "./ChatChannel";
import { useTheme } from "next-themes";

const Chat = () => {
  const chatClient = useInitializeChatClient();

  const { resolvedTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!chatClient) {
    return <Loader2 className="mx-auto my-3 animate-spin" />;
  }

  return (
    <main className="bg-card relative w-full overflow-hidden rounded-2xl shadow-sm">
      <div className="absolute top-0 bottom-0 flex w-full">
        <StreamChat
          client={chatClient}
          theme={
            resolvedTheme === "dark"
              ? "str-chat__theme-dark"
              : "str-chat__theme-light"
          }
        >
          <ChatSidebar
            open={sidebarOpen}
            onclose={() => setSidebarOpen(false)}
          />
          <ChatChannel
            open={!sidebarOpen} //opens when sidebaropen is false mean sidebar is closed
            openSidebar={() => setSidebarOpen(true)}
          />
        </StreamChat>
      </div>
    </main>
  );
};

export default Chat;
