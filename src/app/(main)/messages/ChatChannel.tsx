import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import React from "react";
import {
  Channel,
  ChannelHeader,
  ChannelHeaderProps,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";

interface ChatChannelProps {
  open: boolean;
  openSidebar: () => void;
}
const ChatChannel = ({ open, openSidebar }: ChatChannelProps) => {
  return (
    <div className={cn("w-full min-[700px]:block", !open && "hidden min-[700px]:block")}>
      <Channel>
        <Window>
          <CustomChannelHeader openSidebar={openSidebar} />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </div>
  );
};

export default ChatChannel;

interface CustomChannelHeaderProps extends ChannelHeaderProps {
  openSidebar: () => void;
}

function CustomChannelHeader({
  openSidebar,
  ...props
}: CustomChannelHeaderProps) {
  return (
    <div className="flex items-center truncate p-3">
      <div className="flex h-full items-center justify-center md:hidden">
        <Button size="icon" variant="ghost" onClick={openSidebar}>
          <Menu className="size-5" />
        </Button>
      </div>
      <div className="truncate">
        {" "}
        <ChannelHeader {...props} />{" "}
      </div>
    </div>
  );
}
