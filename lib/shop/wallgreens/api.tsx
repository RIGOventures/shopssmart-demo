'use server'

// Define params we may use

export type Auth = {
    apiKey: string,
    affId: string
}

import { StoreSearchBody, StoreLocationBody } from './types'

import axios from 'axios'

// Sandbox: https://services-qa.walgreens.com/api
// Production: https://services.walgreens.com/api 

// Define base url
const baseUrl = "https://services.walgreens.com/api"

// https://developer.walgreens.com/sites/default/files/v2_StoreInventoryAPI.html#

export async function searchProducts(auth: Auth, 
    term: string, store: string) 
{ 

    // Create request url
    let requestUrl = `https://www.walgreens.com/retailsearch/products/search`

    // Create request body
    let body = {
        //apiKey: auth.apiKey,
        //user_token: "ga0dcy2cjolrc5rjpbd85020",
        //affId: auth.affId,
        //store: store,
        storeId: store,
        //appVer: 1,
        p: 1,
        s: 72,
        sort: "relevance", 
        view: "allView",
        geoTargetEnabled:false,
        q: term,
        searchTerm: term,
        requestType:"search",
        deviceType:"desktop",
        includeDrug:true,
        inStore:true,
    }
    
    // Call the api
    return await axios.post(requestUrl, body)

}

// https://developer.walgreens.com/sites/default/files/v1_StoreLocatorAPI.html

export async function getStoresNearMe(auth: Auth, 
    latitude: number, longitude: number, radiusInMiles = 10, limit = 15) {

    // Create request url
    const requestUrl = `${baseUrl}/stores/search/v2`;

    // Create request body
    let body: StoreLocationBody = {
        apiKey: auth.apiKey,
        affId: auth.affId,
        lat: latitude,
        lng: longitude,
        s: limit,
        p: 1,
        r: radiusInMiles,
        requestType: "locator"
    }

    // Call the api
    return await axios.post(requestUrl, body)
    
}