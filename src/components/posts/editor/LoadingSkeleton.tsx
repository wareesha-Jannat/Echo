import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const LoadingSkeleton = () => {
  return (
    <div className='space-y-3'>
      <div className='bg-card rounded-2xl h-12 w-full animate-pulse'>
      </div>
      <PostLoadingSkeleton />
      <PostLoadingSkeleton />
      <PostLoadingSkeleton />
      
    </div>
  )
}

function PostLoadingSkeleton (){
    return <div className='w-full animate space-y-3 rounded-2xl bg-card p-5 shadom-sm'>
        <div className="flex flex-wrap gap-3">
            <Skeleton className='size-12 rounded-full' />
            <div className='space-y-1.5'> 
                <Skeleton className='h-4 w-24 rounded' />
                <Skeleton className='h-4 w-20 rounded' />
            </div>
        </div>
        <Skeleton className='h-16 rounded' />

    </div>
}

export default LoadingSkeleton
