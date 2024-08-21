'use server'

import { type Product } from '@/lib/types'
import { WalgreensProduct, WalgreensStore } from './types'

import { getStoresNearMe, searchProducts } from './api';

// Get api key
const apiKey = process.env['WALGREENS_API_KEY'] || ''

const auth = {
    apiKey: apiKey,
    affId: "storesapi"
}

// Create a product item standardised with other products
function createItem(product: WalgreensProduct) : Product
{
    console.log(product)
    let [, size, unit ] = item.size.match(/\s*([\d\s\/.]*)\s*(.*)/) || [];
    if (!unit) unit = item.soldBy

    return {
        upc: product.upc,
        id: `walgreens.${product.productId}`,
        description: product.description,
        category: product.categories.length > 0 ? product.categories[0] : undefined,
        price: (item.price?.promo != null && item.price?.promo != 0) ? item.price?.promo: item.price?.regular,
        size: Number(size),
        unit: unit,
        brand: product.brand,
        priority: 0,
        hotness: 0,
        availability: [{ 
            priceLower: item.price?.promo? item.price?.promo : item.price?.regular,
            priceUpper: item.price?.regular
        }],
        availableOnline: item.fulfillment.delivery,
        url: `https://www.walgreens.com/store/c/${product.productPageURI}`,
        imageUrl: product.images?.[0]?.sizes?.[0]?.url
    }
}

export async function getProductsForStore(store: string, term: string) {
    
    // Search this location for a product
    let itemSearchResponse = await searchProducts(auth, term, store);
    console.log(itemSearchResponse.data)
    let products = itemSearchResponse.data.products

    // Get all items in stock
    let items = products.filter((item: WalgreensProduct) => item.q > 0)
        .map((product: WalgreensProduct) => createItem(product))

    return items
}

export async function searchStores(stores: WalgreensStore[], term: string) {

    // Search in these stores
    let storeProducts = await Promise.all(
        stores.flatMap(async (store) => await getProductsForStore(store.storeNumber, term)).flat()
    )

    // Flatten to all products
    let allProducts = storeProducts.flat()
    return allProducts

}

type Location = {
    latitude: number,
    longitude: number,
}

export async function searchWalgreens(term: string[], location: Location, maxDistance?: number) {
    
    let latitude = location.latitude
    let longitude = location.longitude

    if (location.longitude == null || location.latitude == null) {
        throw new Error("InvalidArgumentExcpetion - Need valid location address or coordinates");
    }

    // Get nearby stores
    let locations = await getStoresNearMe(auth, latitude, longitude, maxDistance);
    let stores: WalgreensStore[] = locations.data.results; // Axios returns a data field

    // TODO: Map by term
    return await searchStores(stores.slice(0, 3), term[0])

}