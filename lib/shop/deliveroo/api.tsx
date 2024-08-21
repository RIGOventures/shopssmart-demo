'use server'

// Define params we may use

export type Auth = {
    apiKey: string,
    affId: string
}

import { SearchParams, LocationIdParams, StoreLocationParams } from './types'

import axios from 'axios'
import { addSearchParams } from '@/lib/utils/request'

// Production (https://api.kroger.com/v1/) - A live environment for production traffic.
// Certification (https://api-ce.kroger.com/v1/) - A certified environment for testing.

// Define base url
const baseUrl = "https://partners.deliveroo.com/api/v1/fulfillment"

// https://developer.kroger.com/reference/api/product-api-public#tag/Products/operation/productGet

export async function searchProducts(auth: Auth, 
    term: string, 
    locationId?: string, brand?: string, fulfillment?: string, start?: number, 
    limit = 10) 
{ 

    // Create request url
    let requestUrl = `${baseUrl}/products?filter.limit=${limit}`

    // Create search params
    let params = {
        "filter.term": term,
        "filter.locationId": locationId,
        "filter.brand": brand,
        "filter.fulfillment": fulfillment,
        "filter.start": start,
    }

    // Call the api
    const queryUrl = addSearchParams<SearchParams>(requestUrl, params)
    return await axios.get(queryUrl, { headers: {"Authorization" : `Bearer ${token.access_token}`} })

}

// https://developer.kroger.com/reference/api/product-api-public#tag/Products/operation/productGetID

export async function getProductDetails(auth: Auth,
    id: number, locationId: string) { 

    // Create request url
    const requestUrl = `${baseUrl}/products/{${id}}`

    // Create search params
    let params = { "filter.locationId": locationId }

    // Call the api
    const queryUrl = addSearchParams<LocationIdParams>(requestUrl, params)
    return await axios.get(queryUrl, { headers: {"Authorization" : `Bearer ${token.access_token}`} })

}

// https://developer.kroger.com/reference/api/location-api-public

export async function getStoresNearMe(auth: Auth, latitude: number, longitude: number, radiusInMiles = 10) {

    // Create request url
    const requestUrl = `${baseUrl}/restaurants`;

    // Create search params
    let params = { 
        "lat": latitude,
        "lot": longitude
    }

    // Call the api
    const queryUrl = addSearchParams<StoreLocationParams>(requestUrl, params)
    return await axios.get(queryUrl, { headers: {"Authorization" : `Bearer ${token.access_token}`} })
    
}