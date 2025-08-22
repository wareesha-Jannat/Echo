"use client";
import { UserData } from "@/lib/types";
import React, { PropsWithChildren } from "react";
import UserTooltip from "./UserTooltip";
interface TooltipWrapperProps extends PropsWithChildren {
  user: UserData;
}
const TooltipWrapper = ({ children, user }: TooltipWrapperProps) => {
  return (
    <div>
      <UserTooltip user={user}>{children}</UserTooltip>
    </div>
  );
};

export default TooltipWrapper;
