import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SignUpForm from "./SignUpForm";
import GoogleSignInButton from "../login/google/GoogleSignInButton";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function Page() {
  return (
    <main className="bg-page-gradient flex min-h-[100dvh] items-center justify-center overflow-hidden p-5">
      <div className="flex h-full max-h-140 max-w-236 overflow-hidden rounded-2xl shadow-2xl md:w-full">
        {/* Left side */}
        <div className="w-full space-y-3 overflow-y-auto p-10 max-md:bg-[linear-gradient(224deg,_#d2f3f5_58%,_#0da0e9_40%)] md:w-1/2 dark:max-md:bg-[linear-gradient(224deg,_#0a2a3e_58%,_#074b70_40%)]">
          <div className="space-y-2 text-center">
            <h1 className="text-primary text-3xl font-bold">Sign up to Echo</h1>
            <p className="text-muted-foreground">
              A place where <span>you</span> can find friends
            </p>
          </div>

          <SignUpForm />
          <hr />
          <GoogleSignInButton />
          <Link
            href={"/login"}
            className="mt-3 block text-center hover:underline"
          >
            Already have an account? Log in
          </Link>
        </div>

        {/* Right side image */}
        <div className="relative hidden w-1/2 md:block">
          <Image
            src="/signupForm-image.jpg"
            alt="Sign up illustration"
            fill
            className="object-cover"
            priority
            sizes="80vw"
          />
        </div>
      </div>
    </main>
  );
}
