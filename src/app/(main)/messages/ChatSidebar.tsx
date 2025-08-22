import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "../SessionProvider";
import {
  Avatar,
  ChannelList,
  ChannelPreviewMessenger,
  ChannelPreviewUIComponentProps,
  useChatContext,
} from "stream-chat-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MailPlus, MoreHorizontal, Trash2, X } from "lucide-react";
import NewChatDialog from "./NewChatDialog";
import { CustomChannelData } from "stream-chat";
import UserAvatar from "@/components/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatSidebarProps {
  open: boolean;
  onclose: () => void;
}
const ChatSidebar = ({ open, onclose }: ChatSidebarProps) => {
  const { user } = useSession();

  const queryClient = useQueryClient();
  const { channel } = useChatContext();

  useEffect(() => {
    if (channel?.id) {
      queryClient.invalidateQueries({ queryKey: ["unred-messages-count"] });
    }
  }, [channel?.id, queryClient]);

  const ChannelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => (
      <CustomChannelPreviewMessenger
        props={props}
        onSelect={() => {
          props.setActiveChannel?.(props.channel, props.watchers);
          onclose();
        }}
      />
    ),
    [onclose],
  );
  return (
    <div
      className={cn(
        "flex size-full flex-col border-e sm:w-72",
        open ? "flex" : "hidden md:flex",
      )}
    >
      <MenuHeader onclose={onclose} />
      <ChannelList
        filters={{
          type: "messaging",
          members: { $in: [user.id] },
        }}
        showChannelSearch
        options={{ state: true, presence: true, watch: true, limit: 8 }}
        sort={{ last_message_at: -1 }}
        additionalChannelSearchProps={{
          searchForChannels: true,
          searchQueryParams: {
            channelFilters: {
              filters: { members: { $in: [user.id] } },
            },
          },
        }}
        Preview={ChannelPreviewCustom}
        channelRenderFilterFn={(channels) => {
          const seenChannelIds = new Set<string>();
          const uniqueChannels: typeof channels = [];

          for (const ch of channels) {
            if (!ch.id) continue; // skip channels without an id move to next iteration

            if (!seenChannelIds.has(ch.id)) {
              seenChannelIds.add(ch.id);
              uniqueChannels.push(ch);
            }
          }

          return uniqueChannels;
        }}
      />
    </div>
  );
};

export default ChatSidebar;

interface MenuHeaderProps {
  onclose: () => void;
}

function MenuHeader({ onclose }: MenuHeaderProps) {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 p-2">
        <div className="h-full md:hidden">
          <Button size="icon" variant="ghost" onClick={onclose}>
            <X className="size-5" />
          </Button>
        </div>
        <h1 className="text-primary me-auto text-xl font-bold md:ms-2">
          Messages
        </h1>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowNewChatDialog(true)}
        >
          <MailPlus className="size-5" />
        </Button>
      </div>
      {showNewChatDialog && (
        <NewChatDialog
          onOpenChange={setShowNewChatDialog}
          onChatCreated={() => {
            setShowNewChatDialog(false);
            onclose();
          }}
        />
      )}
    </>
  );
}

interface CustomChannelPreviewMessengerProps {
  props: ChannelPreviewUIComponentProps;
  onSelect: () => void;
}

function CustomChannelPreviewMessenger({
  props,
  onSelect,
}: CustomChannelPreviewMessengerProps) {
  const { channel, setActiveChannel } = props;
  const { client } = useChatContext();

  let isCreator = channel.data?.created_by?.id === client.userID;

  const handleDelete = async () => {
    try {
      await channel.delete();
      console.log(`Channel ${channel.id} deleted`);
    } catch (error) {
      console.log("Failed to delete channel", error);
    }
  };

  const members = Object.values(channel.state.members);
  const otherUser = members.filter((m) => m.user?.id !== client.userID);
  return (
    <div
      className="hover:bg-muted flex cursor-pointer items-center justify-between px-3 py-2"
      onClick={(event) => {
        setActiveChannel?.(channel, props.watchers);
        props.onSelect?.(event);
      }}
    >
      <div className="flex items-center gap-3 max-w-50">
        <UserAvatar
          avatarUrl={
            otherUser?.length === 1
              ? otherUser[0].user?.image
              : otherUser.map((u) => u.user?.name?.[0] ?? "").join("")
          }
        />
        <div className="flex min-w-0 flex-col">
          <span className="font-medium ">
            {channel.data?.name || otherUser[0].user?.name || "UnnamedChat"}
          </span>
          <span className="text-muted-foreground truncate text-sm">
            {channel.state.messages[channel.state.messages.length - 1]?.text ||
              "No messages yet"}
          </span>
        </div>
      </div>
      {isCreator && <DeleteChatButton handleDelete={handleDelete} />}
    </div>
  );
}

interface DeleteChatButtonProps {
  handleDelete: () => void;
}

function DeleteChatButton({ handleDelete }: DeleteChatButtonProps) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreHorizontal className="text-muted-foreground size-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem
            className="flex items-center justify-center gap-2"
            onClick={(e) => {
              e.stopPropagation(); // prevent channel selection
              handleDelete();
            }}
          >
            <Trash2 className="size-4 text-red-500" />
            <span>Delete Chat</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
