"use client";
import { Button } from "@/components/ui/button";

import { useMutation } from "@tanstack/react-query";
import React from "react";
import { DeleteAccount } from "./actions";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface DeleteAccountProps {
  id: string;
}
const DeleteAccountButton = ({ id }: DeleteAccountProps) => {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (id: string) =>{
        const c = confirm("Are you sure you want to delete your account this action cannot be undone?")
          if(c) {return DeleteAccount(id) }
          return Promise.reject("User cancelled the deletion.");
    } ,
    onSuccess: () => {
      toast({
        description: "Account deleted Successfully",
      });
      
      router.push("/signup");
    },
    onError: (error) => {
        if (typeof error ===  "string"  && error  === "User cancelled the deletion.") return;
      toast({
        variant: "destructive",
        description: "Failed to delete account. Please try again later",
      });
    },
  });

  return (
    <Button
      variant="destructive"
      onClick={() => mutation.mutate(id)}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "Deleting ..." : "Delete Account"}
    </Button>
  );
};

export default DeleteAccountButton;
