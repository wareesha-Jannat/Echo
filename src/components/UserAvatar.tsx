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
  const isUrl = avatarUrl?.startsWith("http") || avatarUrl?.startsWith("/")
  return isUrl ?  (
    <Image
      src={avatarUrl!}
      alt=""
      height={size}
      width={size}
      quality={100}
      className={cn(
        "bg-secondary aspect-square h-fit flex-none rounded-full object-cover",
        className,
      )}
    />
  ) : (
    <div
      className="flex items-center justify-center rounded-full bg-primary text-white"
      style={{ width: avatarUrl && avatarUrl.length > 1 ? 80 : size, height: avatarUrl && avatarUrl.length > 1 ? 40 : size, fontSize: size / 2.5 }}
    >
      {avatarUrl} {/* this will show initials */}
    </div>
  );
  
}
