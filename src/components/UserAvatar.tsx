import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
}

export default function UserAvatar({
  avatarUrl,
  size = 42,
  className,
}: UserAvatarProps) {
  const isUrl = avatarUrl?.startsWith("http") || avatarUrl?.startsWith("/");
  return isUrl ? (
    <Image
      src={avatarUrl!}
      alt="User Avatar"
      height={size}
      width={size}
      sizes={`${size}px`}
      quality={85}
      className={cn(
        "bg-secondary aspect-square h-fit flex-none rounded-full object-cover",
        className,
      )}
    />
  ) : (
    <div
      className="bg-primary flex items-center justify-center rounded-full text-white"
      style={{
        width: avatarUrl && avatarUrl.length > 1 ? 80 : size,
        height: avatarUrl && avatarUrl.length > 1 ? 40 : size,
        fontSize: size / 2.5,
      }}
    >
      {avatarUrl} {/* this will show initials */}
    </div>
  );
}
