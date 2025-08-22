import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "./Navbar";

import MenuBar from "./MenuBar";
import SessionWrapper from "./SessionWrapper";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();
  if (!session.user) redirect("/login");

  return (
    <SessionWrapper value={session}>
      <div className="flex min-h-screen flex-col">
        <Navbar />

        <div className="mx-auto flex w-full max-w-7xl grow gap-5 p-5">
          <MenuBar className="bg-card spaace-y-3 sticky top-21 hidden h-fit flex-none rounded-2xl py-3 shadow-sm sm:block xl:w-80" />
          {children}
        </div>
        <MenuBar className="bg-card sticky bottom-0 mx-auto flex w-[90vw] items-center justify-center space-x-2 rounded-2xl border-t p-2 shadow-sm sm:hidden" />
      </div>
    </SessionWrapper>
  );
}
