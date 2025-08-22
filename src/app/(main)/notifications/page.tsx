import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata } from "next";
import React from "react";
import Notifications from "./Notifications";

export const metadata: Metadata = {
  title: "Notifications",
};

const page = () => {
  return (
    <div className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="bg-card rounded-2xl p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold"> All Notifications</h1>
        </div>
        <Notifications />
      </div>
      <TrendsSidebar />
    </div>
  );
};

export default page;
