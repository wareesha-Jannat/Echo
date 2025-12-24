import { Metadata } from "next";

import LoginForm from "./LoginForm";
import Link from "next/link";
import GoogleSignInButton from "./google/GoogleSignInButton";

export const metadata: Metadata = {
  title: "Login",
};

export default function Page() {
  return (
    <main className="bg-page-gradient flex min-h-[100dvh] items-center justify-center overflow-hidden">
      <div className="flex h-full max-h-140 max-w-236 rounded-2xl shadow-2xl md:w-full">
        <div className="w-full space-y-8 overflow-y-auto rounded-2xl p-10 max-md:bg-[linear-gradient(224deg,_#d2f3f5_58%,_#0da0e9_40%)] md:w-1/2 dark:max-md:bg-[linear-gradient(224deg,_#0a2a3e_58%,_#074b70_40%)]">
          <h1 className="text-primary text-center text-3xl font-bold">
            Login to Echo
          </h1>
          <div className="space-y-5">
            <GoogleSignInButton />
            <div className="flex items-center gap-3">
              <div className="bg-muted h-px flex-1" />
              <span>OR</span>
              <div className="bg-muted h-px flex-1" />
            </div>
            <LoginForm />
            <Link
              href={"/signup"}
              className="mt-2 block text-center hover:underline"
            >
              Don&apos;t have an account? Sign up
            </Link>
            <Link
              href={"/forgot-password"}
              className="mt-2 block text-center hover:underline"
            >
              forgot password?
            </Link>
          </div>
        </div>

        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="hidden object-cover md:block md:w-1/2"
        >
          {" "}
          <source src="/login-video.mp4" type="video/mp4" />
        </video>
      </div>
    </main>
  );
}
