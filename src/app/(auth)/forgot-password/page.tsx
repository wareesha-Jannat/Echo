import { Metadata } from "next";
import React from "react";
import ForgotPassword from "./ForgotPassword";

export const metadata: Metadata = {
  title: "Forgot password",
};

const page = () => {
  return (
    <main className="bg-page-gradient flex min-h-[100dvh] items-center justify-center overflow-hidden ">
      <div className="flex h-full max-h-80 max-w-120 flex-col rounded-2xl bg-[linear-gradient(224deg,_#d2f3f5_60%,_#0da0e9_40%)] p-5 shadow-lg sm:w-full dark:bg-[linear-gradient(224deg,_#0a2a3e_60%,_#074b70_40%)] ">
        <h1 className="text-primary mt-8 mb-5 text-center text-3xl font-bold">
          Forgot Password
        </h1>
        <div className="space-y-5 px-4">
          <ForgotPassword />
        </div>
      </div>
    </main>
  );
};

export default page;
