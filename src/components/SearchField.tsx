"use client";

import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";

export default function SearchField() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.q as HTMLInputElement).value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      method="GET"
      action={"/search"}
      className="order-3 max-[450px]:w-full"
    >
      <div className="relative">
        <Input
          placeholder="Search"
          name="q"
          className="w-full border !bg-transparent pe-10"
        />
        <SearchIcon className="text-muted-foreground absolute top-1/2 right-5 size-5 -translate-y-1/2 transform" />
      </div>
    </form>
  );
}
