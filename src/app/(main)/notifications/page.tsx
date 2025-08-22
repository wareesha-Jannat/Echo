import TrendsSidebar from '@/components/TrendsSidebar'
import { Metadata } from 'next'
import React from 'react'
import Notifications from './Notifications'

export const metadata : Metadata ={
    title : "Notifications"
}

const page = () => {
  return (
    <div className='flex min-w-0 w-full gap-5'>
        <div className='w-full min-w-0 space-y-5 '>
            <div className='rounded-2xl bg-card shadow-sm p-5'>
                <h1 className='text-2xl font-bold text-center'> All Notifications</h1>
            </div>
            <Notifications />
        </div>
      <TrendsSidebar />
    </div>
  )
}

export default page
