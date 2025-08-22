"use client"
import InfiniteScrollContainer from '@/components/InfiniteScrollContainer'
import LoadingSkeleton from '@/components/posts/editor/LoadingSkeleton'
import Post from '@/components/posts/Post'
import kyInstance from '@/lib/ky'
import { PostsPage } from '@/lib/types'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import React from 'react'

const Bookmarks = () => {

      const {data, hasNextPage, fetchNextPage, isFetchingNextPage, status, isFetching } = useInfiniteQuery({
        queryKey : ["All-bookmarks"],
        queryFn : ({pageParam}) => kyInstance.get(`/api/posts/allBookmarks`, pageParam ? {searchParams : {cursor : pageParam}} : {}).json<PostsPage>(),
        initialPageParam : null as string | null,
        getNextPageParam : (lastPage) => lastPage.nextCursor
    });

    const posts = data?.pages.flatMap((p)=> p.posts) || []
     if(status === "pending") {
            return <div>
                <LoadingSkeleton />
            </div>
        }
        if(status === "success" && !hasNextPage  && !posts.length) {
            return <p className='text-center text-muted-foreground'>
                Nothing bookmarked yet
            </p>
        }
         if(status === "error") {
            return <div className='text-center text-destructive'>
                <p>Error Loading posts</p>
            </div>
        }
  return (
    
        <InfiniteScrollContainer  className='space-y-5' onBottomReached={()=> hasNextPage && !isFetching && fetchNextPage()} >
      {posts.map(post => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <Loader2 className='mx-auto my-3 animate-spin' /> }
       
    </InfiniteScrollContainer>
    
  )
}

export default Bookmarks
