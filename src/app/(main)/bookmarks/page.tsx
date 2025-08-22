import TrendsSidebar from "@/components/TrendsSidebar";
import React from "react";
import Bookmarks from "./Bookmarks";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookmarks",
};

const page = () => {
  return (
    <div className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="bg-card rounded-2xl p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold"> All Bookmarks</h1>
        </div>
        <Bookmarks />
      </div>
      <TrendsSidebar />
    </div>
  );
};

export default page;
