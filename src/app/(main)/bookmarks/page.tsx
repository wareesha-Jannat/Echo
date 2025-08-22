import TrendsSidebar from '@/components/TrendsSidebar'
import React from 'react'
import Bookmarks from './Bookmarks'
import { Metadata } from 'next'

export const metadata :Metadata ={
  title : "Bookmarks"
}

const page = () => {
  return (
    <div className='flex min-w-0 w-full gap-5'>
        <div className='w-full min-w-0 space-y-5 '>
            <div className='rounded-2xl bg-card shadow-sm p-5'>
                <h1 className='text-2xl font-bold text-center'> All Bookmarks</h1>
            </div>
            <Bookmarks />
        </div>
      <TrendsSidebar />
    </div>
  )
}

export default page
