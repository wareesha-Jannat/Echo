import { PostData } from "@/lib/types";
import React, { useState } from "react";
import { useSubmitPostMutation } from "../posts/editor/mutations";
import { useSubmitCommentMutation } from "./mutations";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, SendHorizonal } from "lucide-react";

interface AddCommentProps {
  post: PostData;
}
const AddComment = ({ post }: AddCommentProps) => {
  const [input, setInput] = useState("");
  const mutation = useSubmitCommentMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;

    mutation.mutate({
      post,
      commentMessage: input,
    }, {onSuccess: ()=> setInput("")});
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-5">
        <Input
          placeholder="Write a comment"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
        <Button
          disabled={mutation.isPending || !input.trim()}
          type="submit"
          variant="ghost"
          size="icon"
        >
          {mutation.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <SendHorizonal />
          )}
        </Button>
      </form>
    </div>
  );
};

export default AddComment;
