import React, { PropsWithChildren } from 'react'
import SessionProvider from './SessionProvider'

import { SessionAuth, UserAuth } from '@/lib/types'
interface SessionWrapperProps extends PropsWithChildren{
 value : {
    user : UserAuth,
    session : SessionAuth
 }
}

const SessionWrapper = ({children , value}: SessionWrapperProps) => {
  return (
    <SessionProvider value={value}>
        {children}
    </SessionProvider>
  )
}

export default SessionWrapper
