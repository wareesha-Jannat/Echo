import { Metadata } from "next";
import React from "react";
import ResetPassword from "./ResetPassword";

export const metadata: Metadata = {
  title: "Reset Password",
};
const page = () => {
  return (
    <main className="bg-page-gradient flex min-h-[100dvh] items-center justify-center overflow-hidden">
      <div className="flex h-full max-h-100 max-w-140 flex-col rounded-2xl bg-[linear-gradient(224deg,_#d2f3f5_58%,_#0da0e9_40%)] p-5 shadow-2xl sm:w-full dark:bg-[linear-gradient(224deg,_#0a2a3e_58%,_#074b70_40%)]">
        <h1 className="text-primary mb-5 text-center text-3xl font-bold">
          Reset Password
        </h1>
        <div className="space-y-5 px-4">
          <ResetPassword />
        </div>
      </div>
    </main>
  );
};

export default page;
