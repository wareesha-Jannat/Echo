import { useToast } from "@/components/ui/use-toast";
import { useChatContext } from "stream-chat-react";
import { useSession } from "../SessionProvider";
import { useState } from "react";
import { UserResponse } from "stream-chat";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Loader2, SearchIcon, X } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import useDebounce from "@/app/hooks/useDebounce";
import UserAvatar from "@/components/UserAvatar";

interface NewChatDialogProps {
  onOpenChange: (open: boolean) => void;
  onChatCreated: () => void;
}

const NewChatDialog = ({ onOpenChange, onChatCreated }: NewChatDialogProps) => {
  const { client, setActiveChannel } = useChatContext();
  const { toast } = useToast();

  const { user: loggedInUser } = useSession();
  const [searchInput, setSearchInput] = useState("");
  const searchInputDebounced = useDebounce(searchInput);
  const [selectedUsers, setSelectedUsers] = useState<UserResponse[]>([]);

  const { data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ["stream-users", searchInputDebounced],

    queryFn: async () => {
      const q = searchInputDebounced.toLowerCase();
      return client.queryUsers(
        {
          ...(q
            ? {
                $or: [
                  { name: { $autocomplete: q } },
                  { username: { $autocomplete: q } },
                ],
              }
            : {}),
        },
        { name: 1, username: 1 },
        { limit: 15 },
      );
    },
  });

  const filteredUsers = data?.users.filter(
    (u) => u.id !== loggedInUser.id && u.role !== "Admin",
  );

  const mutation = useMutation({
    mutationFn: async () => {
      const members = [loggedInUser.id, ...selectedUsers.map((u) => u.id)];

      const channel = client.channel("messaging", null, {
        members,
        name:
          members.length > 2
            ? `${loggedInUser.displayName}, ${selectedUsers.map((u) => u.name).join(", ")}`
            : "",
      });
      await channel.watch();

      return channel;
    },
    onSuccess: (channel) => {
      setActiveChannel(channel);
      onChatCreated();
    },
    onError(error) {
      toast({
        variant: "destructive",
        description: "Error starting chat. Please try again,",
      });
    },
  });

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="bg-card p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle> New Chat </DialogTitle>
        </DialogHeader>
        <div className="group relative">
          <SearchIcon className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-5 size-5 -translate-y-1/2 transform" />
          <input
            placeholder="search users..."
            className="h-12 w-full ps-14 pe-4 focus:outline-none"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        {!!selectedUsers.length && (
          <div className="mt-4 flex flex-wrap gap-2 p-2">
            {selectedUsers.map((user) => (
              <SelectedUserTag
                key={user.id}
                user={user}
                onRemove={() => {
                  setSelectedUsers((prev) =>
                    prev.filter((u) => u.id !== user.id),
                  );
                }}
              />
            ))}
          </div>
        )}
        <hr />
        <div className="h-96 overflow-y-auto">
          {isSuccess &&
            filteredUsers?.map((user) => (
              <UserResult
                key={user.id}
                user={user}
                selected={selectedUsers.some((u) => u.id === user.id)}
                onClick={() => {
                  setSelectedUsers((prev) =>
                    prev.some((u) => u.id === user.id)
                      ? prev.filter((u) => u.id !== user.id)
                      : [...prev, user],
                  );
                }}
              />
            ))}
          {isSuccess && !data.users.length && (
            <p className="text-muted-foreground my-3 text-center">
              No users found. Try a different name.
            </p>
          )}
          {isFetching && <Loader2 className="mx-auto my-3 animate-spin" />}
          {isError && (
            <p className="text-destructive my-3 text-center">
              An error occurred while loading users.
            </p>
          )}
        </div>

        <DialogFooter className="px-6 pb-6">
          <LoadingButton
            disabled={!selectedUsers.length}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Start chat
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatDialog;

interface UserResultProps {
  user: UserResponse;
  selected: boolean;
  onClick: () => void;
}

function UserResult({ user, selected, onClick }: UserResultProps) {
  return (
    <button
      className="hover:bg-muted/50 flex w-full items-center justify-between px-4 py-2.5 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <UserAvatar avatarUrl={user.image} />
        <div className="flex flex-col text-start">
          <p className="font-bold">{user.name}</p>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>
      </div>
      {selected && <Check className="text-primary size-5" />}
    </button>
  );
}

interface SelectedUserTagProps {
  user: UserResponse;
  onRemove: () => void;
}

function SelectedUserTag({ user, onRemove }: SelectedUserTagProps) {
  return (
    <button
      onClick={onRemove}
      className="hover:bg-muted/50 flex items-center gap-2 rounded-full border p-1"
    >
      <UserAvatar avatarUrl={user.image} size={24} />
      <p className="font-bold">{user.name}</p>
      <X className="text-muted-foreground mx-2 size-5" />
    </button>
  );
}
