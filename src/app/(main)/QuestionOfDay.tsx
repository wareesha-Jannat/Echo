"use client"
import { Button } from '@/components/ui/button'
import kyInstance from '@/lib/ky'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Sparkles } from 'lucide-react'
import React from 'react'
import { useQod } from './QodContext'



const QuestionOfDay = () => {
 const {qod,setQod} = useQod()
 
    const {data, isPending}= useQuery({
        queryKey : ["question-of-the-day"],
        queryFn : () => kyInstance.get('/api/question-of-the-day').json<{question : string}>()

    })
  
  return (
    <div className='bg-card shadow-sm flex flex-col p-4 rounded-2xl items-center justify-center gap-2'>
        <div className='flex justify-between items-center flex-col gap-3 min-[450px]:flex-row sm:gap-0 w-full'>
        <div className='flex  items-center gap-2 text-primary font-semibold'>
            <Sparkles className='size-4' />
           <span> Question of the day</span>
        </div>
        <Button type="button" className="bg-primary text-white " onClick={()=> setQod(!qod)}>{qod ? "All posts" : "Answered posts"}</Button>
        </div>
        {isPending ? (
            <Loader2 className='animate-spin' />
        ): (
   <p className='text-lg font-medium  leading-snug'>{data?.question}</p>
        )}
       
      
    </div>
  )
}

export default QuestionOfDay
