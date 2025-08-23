import { FollowingData, UserData } from '@/lib/types'
import React, { PropsWithChildren } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import Link from 'next/link'
import UserAvatar from './UserAvatar'
import { useSession } from '@/app/(main)/SessionProvider'
import FollowButton from './FollowButton'
import FollowerCount from './FollowerCount'
interface UserTooltipProps extends PropsWithChildren{
  user : UserData
}

const UserTooltip = ({children, user}: UserTooltipProps) => {
 const {user : loggedInUser} =  useSession();

 const followerState :FollowingData = {
    followers : user._count.followers,
    isFollowedByUser: !!user.followers.some(({followerId})=> followerId === loggedInUser.id)
 }
  return (
    <TooltipProvider>
    <Tooltip>
        <TooltipTrigger asChild>
         {children}
        </TooltipTrigger>
        <TooltipContent>
            <div className='flex max-w-80 flex-col gap-3  break-words px-1 py-2 md:min-w-52'>
                <div className="flex items-center justify-between gap-2">
                    <Link href={`/users/${user.username}`}>
                    <UserAvatar avatarUrl={user.avatarUrl  || user.displayName?.[0]} size={70} />
                    </Link>
                    {loggedInUser.id != user.id && 
                    (
                        <FollowButton userId={user.id} initialState={followerState} />
                    )}
                </div>
                <div>
            <Link
              href={`/users/${user.username}`}
             
            >
                <div  className="text-lg font-semibold hover:underline">{user.displayName}</div>
                <div  className="text-muted-foreground">@{user.username}</div>
              
            </Link>
            </div>
            <FollowerCount userId={user.id} initialState={followerState} />
            </div>
        </TooltipContent>
    </Tooltip>
    </TooltipProvider>
  )
}

export default UserTooltip
