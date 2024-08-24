// This file contains type definitions for data.
// It describes the shape of the data, and what data type each property should accept.

import { CoreMessage } from 'ai'
import { ResultCode } from '@/lib/utils/result'

/**
type CoreUserMessage = {
    role: string;
    content: UserContent;
};
*/

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

export interface Preferences {
    lifestyle?: string, 
    allergen?: string, 
    health?: string
}

export interface Result {
    type: string;
    resultCode: ResultCode
}

export type ServerActionResult<Result> = Promise<Result | { error: string }>

export type ProductAvailability = {
    id?: string,
    quantity?: number,
    priceLower: number,
    priceUpper: number
}

export interface Product {
    // Identification
    upc?: string
    id: string
    // Description
    description: string
    category?: string
    price: number
    size?: number
    unit?: string
    brand: string
    // Preferences
    priority?: number
    hotness?: number
    availability: ProductAvailability[]
    availableOnline: boolean
    rating?: string
    // Links
    url: string
    imageUrl: string
}