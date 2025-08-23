import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <header className="bg-page-gradient sticky top-0 z-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 min-[450px]:gap-5  px-5 py-3 min-[450px]:justify-center">
        <Link
          href={"/"}
          className="text-primary order-1 flex gap-1 text-2xl font-bold"
        >
          <Image
            src="/echo.png"
            alt="Echo logo"
            height={32}
            width={32}
            priority
          />

          <span>Echo</span>
        </Link>
        <SearchField />
        <UserButton className="order-2 bg-transparent min-[450px]:order-3 sm:ml-auto" />
      </div>
    </header>
  );
};

export default Navbar;
