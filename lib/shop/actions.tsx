'use server'

import axios from 'axios'

// Configure API key authorization: apiKeyScheme
const apiKey = process.env['SPOONACULAR_API_KEY']

const baseUrl = "https://api.spoonacular.com"

export async function queryItem(item: string) { 

    const requestUrl = `${baseUrl}/food/products/search`

    const queryWithParams  = new URL(requestUrl)

    let params = {
        apiKey: apiKey,
        query: item, // String | The (natural language) search query.
        addProductInformation: 'true'
    }

    for (const [key, value] of Object.entries(params)) {
        queryWithParams.searchParams.append(key, value || '');
    }

    return await axios.get(queryWithParams.href)

}

export async function getProductInformation(id: number) { 

    const requestUrl = `${baseUrl}/food/products/${id}`

    const queryWithParams  = new URL(requestUrl)

    let params = { apiKey: apiKey }

    for (const [key, value] of Object.entries(params)) {
        queryWithParams.searchParams.append(key, value || '');
    }

    return await axios.get(queryWithParams.href)

}