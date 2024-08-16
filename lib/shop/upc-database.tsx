'use server'

import axios from 'axios'
import { buildUrl } from '../utils'

// Configure API key authorization: apiKeyScheme
const apiKey = process.env['UPC_DATABASE'] || ''

const baseUrl = "https://api.upcdatabase.org"

// https://upcdatabase.org/api-search
export async function searchUPCItem(item: string) { 

    // Create request url
    const requestUrl = `${baseUrl}/search`

    // Create search params
    let params = {
        query: item, // String | The (natural language) search query.
    }

    // Call the api
    const queryUrl = buildUrl(requestUrl, params)
    return await axios.get(queryUrl, { headers: {"Authorization" : `Bearer ${apiKey}`} })

}

export async function getUPCInformation(upc: string | number) { 

    // Create request url
    const requestUrl = `${baseUrl}/product/${upc}`

    // Call the api
    const queryUrl = buildUrl(requestUrl, {})
    return await axios.get(queryUrl, { headers: {"Authorization" : `Bearer ${apiKey}`} })

}