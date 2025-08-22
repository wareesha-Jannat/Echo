"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema, ForgotPasswordValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { HandleForgotPassword } from "./actions";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import LoadingButton from "@/components/LoadingButton";

const ForgotPassword = () => {
  const [error, setError] = useState<String | undefined>(undefined);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ForgotPasswordValues) => HandleForgotPassword(values),
    onSuccess: (data) => {
      if ("error" in data) {
        setError(data.error);
        toast({
          variant: "destructive",
          description: data.error,
        });
        return;
      }
      toast({
        description:
          "Password reset link sent successfully, please check your email",
      });
    },
    onError: () => {
      setError("unExpected error");
      toast({
        variant: "destructive",
        description: "Failed to send reset password link. Please try again ",
      });
    },
  });

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="w-full space-y-3"
        >
          {error && <p className="text-destructive text-center">{error}</p>}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="enter your email"
                    {...field}
                    type="email"
                    className="mt-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <LoadingButton
            disabled={mutation.isPending}
            type="submit"
            loading={mutation.isPending}
          >
            {mutation.isPending ? "Sending Link " : "Send Link "}
          </LoadingButton>
        </form>
      </Form>
    </div>
  );
};

export default ForgotPassword;
