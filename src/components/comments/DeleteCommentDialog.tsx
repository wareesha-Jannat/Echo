import { CommentData } from "@/lib/types";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import LoadingButton from "../LoadingButton";
import { Button } from "../ui/button";
import { useDeleteCommentMutation } from "./mutations";

interface DeleteCommentDialogProps {
  comment: CommentData;
  open: boolean;
  onclose: () => void;
}
const DeleteCommentDialog = ({
  comment,
  open,
  onclose,
}: DeleteCommentDialogProps) => {
  const mutation = useDeleteCommentMutation();

  const handleOpenChange = () => {
    if (!open || !mutation.isPending) {
      onclose();
    }
  };
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Comment?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this comment?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <LoadingButton
            variant="destructive"
            loading={mutation.isPending}
            onClick={() => {
              mutation.mutate(comment.id, { onSuccess: () => onclose() });
            }}
          >
            Delete
          </LoadingButton>
          <Button
            variant="outline"
            onClick={onclose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCommentDialog;
