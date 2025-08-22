"use client";
import { PasswordInput } from "@/components/PasswordInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { passwordResetSchema, PasswordResetValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { SubmitResetPassword } from "./actions";
import { toast } from "@/components/ui/use-toast";
import LoadingButton from "@/components/LoadingButton";

const ResetPassword = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token") ?? "";

  const form = useForm<PasswordResetValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: PasswordResetValues) => {
      const newValues = { values, token };
      return SubmitResetPassword(newValues);
    },
    onSuccess: (data) => {
      if ("error" in data) {
        toast({
          variant: "destructive",
          description: data.error,
        });
        return;
      }
      toast({
        description: "Password reset successfully",
      });
      router.push("/login");
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to reset password. Please try again",
      });
      router.push("/forgot-password");
    },
  });

  if (!token) {
    return (
      <div className="text-center text-red-500">
        Invalid or missing reset token.
      </div>
    );
  }

  return (
    <>
      <Form {...form}>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Enter password"
                    {...field}
                    className="mt-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Confirm password"
                    {...field}
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
            {mutation.isPending ? "Saving.. " : "Save"}
          </LoadingButton>
        </form>
      </Form>
    </>
  );
};

export default ResetPassword;
