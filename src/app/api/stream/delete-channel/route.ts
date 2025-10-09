import streamServerClient from "@/lib/stream";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { channelId, userId, isGroupChat } = await req.json();

    const channel = streamServerClient.channel("messaging", channelId);

    const channelState = await channel.query();

    const name = channel.data?.name;

    if (isGroupChat) {
      await channel.removeMembers([userId]);

      const memberNames = Object.values(channelState.members || {})
        .map((m) => m.user?.name)
        .filter(Boolean) as string[];

      const newMemberNames = memberNames.filter(
        (name) => name !== channelState.members[userId]?.user?.name,
      );

      await channel.updatePartial({
        set: {
          name: newMemberNames.join(", ") + " GC",
        },
      });
    } else {
      await channel.hide(userId, true);
    }

    // Final cleanup: check if no members left and channel is marked deleted by creator
    const updatedChannel = await channel.query();

    const membersKeys = Object.keys(updatedChannel.members || {}); // fallback to empty object

    if (membersKeys.length === 0) {
      await channel.delete({ hard_delete: true });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete channel" },
      { status: 500 },
    );
  }
}
