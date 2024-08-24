'use server'

// Define params we may use

export type Auth = {
    apiKey: string,
    affId: string
}

import { StoreLocationBody } from './types'

import axios from 'axios';
const randomUseragent = require('random-useragent');

const puppeteer = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

// Sandbox: https://services-qa.walgreens.com/api
// Production: https://services.walgreens.com/api 

// Define base url
const siteUrl = "https://www.walgreens.com"
const baseUrl = "https://services.walgreens.com/api"

export async function searchProducts(token = "ct86hsyrelivzamlpgzi1i0x",
    term: string, storeId: string, pageNumber = 1) 
{ 

    // Create request url
    let searchPath = "/retailsearch/products/search"
    let requestUrl = `${siteUrl}${searchPath}`;

    // Create headers
    let headers = {
        'Content-Type': 'application/json',
        'User-Agent': randomUseragent.getRandom(function (ua: any) {
            return ua.browserName === 'Firefox';
        }),
        'Origin': "https://www.walgreens.com",
        'Referer': `https://www.walgreens.com/search/results.jsp?Ntt=${term}`
    }

    // Create body
    let body = {
        "p": pageNumber,
        "s": "72",
        "view": "allView",
        "geoTargetEnabled": false,
        "deviceType": "desktop",
        "q": term, 
        "searchTerm": term,
        "requestType": "search",
        "user_token": token,
        "includeDrug": true,
        "sort": "relevance",
        "storeId": storeId,
    }

    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request: any) => {
        if (request.resourceType() === 'image') {
            return request.abort();
        }

        if (request.isInterceptResolutionHandled()) return;
        if (request.url().includes(searchPath)) {
            console.log(request.url());
            let postData = request.postData()
            if (postData) {
                // Use the user token
                let obj = JSON.parse(postData);
                body.user_token = obj.user_token

                // send manipulated method, headers or body.
                return request.continue({
                    method: 'POST',
                    postData: body,
                    headers: request.headers()
                });
            }
            
        }
        
        if (request.url().includes('stores')) {
            console.log(request.url());
        }
        
        request.continue(); // send request without manipulation.
    });

    page.on('response', async (response: any) => {
        if (response.url().includes(searchPath)) {
            console.log(response.url());

            try {
                const body = await response.text();
                console.log('response body:', body);
            } catch {
                console.log('response body error!');
            }
        }
    });

    await page.goto(`https://www.walgreens.com/search/results.jsp?Ntt=undefined`);

    await page.waitForNavigation({waitUntil: 'domcontentloaded'})
        
    await new Promise(r => setTimeout(r, 2000))
    
    await page.waitForSelector('.blue-shadow.ellipsis')
    await page.focus('.blue-shadow.ellipsis')
    await page.type('.blue-shadow.ellipsis', term)
    
    await new Promise(r => setTimeout(r, 2000))

    await page.keyboard.press('Enter') // 4 LINES ABOVE ALSO WORKS, TRY THEM ALL

    //await browser.close();

    // Call the api
    return await axios.post(requestUrl, body, { headers: headers })

}

// https://developer.walgreens.com/sites/default/files/v2_StoreInventoryAPI.html#
export async function getProduct(id: string | number, pageNumber = 1) 
{ 

    // Create request url
    let requestUrl = `${siteUrl}/productsearch/v1/products/(RVI)`;

    // Create headers
    let headers = {
        'Content-Type': 'application/json',
        'User-Agent': randomUseragent.getRandom(function (ua: any) {
            return ua.browserName === 'Firefox';
        })
    }

    // Call the api
    return await axios.post(requestUrl, { rvi: [id] }, { headers: headers })

}

// https://developer.walgreens.com/sites/default/files/v2_StoreInventoryAPI.html#
export async function getStoreInventory(auth: Auth, 
    store: string) 
{ 

    // Create request url
    let requestUrl = `${baseUrl}/products/inventory/v4`;

    // Create request body
    let body = {
        apiKey: auth.apiKey,
        affId: auth.affId,
        store: store,
        appVer: 1,
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