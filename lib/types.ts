// This file contains type definitions for data.
// It describes the shape of the data, and what data type each property should accept.

import { CoreMessage } from 'ai'
import { ResultCode } from '@/lib/utils'

export type Message = CoreMessage & {
    id: string
}

export interface Chat extends Record<string, any> {
    id: string
    title: string
    createdAt: Date
    userId: string
    path: string
    messages: Message[]
    sharePath?: string
}

export interface Session {
    user: {
      id: string
      email: string
    }
}

export type Recommendation = {
    title: string, 
    description: string
};

export interface User extends Record<string, any> {
    id: string
    email: string
    password: string
}

export interface UserRequestData {
	count: number;
	lastResetTime: number;
}

export interface Result {
    type: string;
    resultCode: ResultCode
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>
