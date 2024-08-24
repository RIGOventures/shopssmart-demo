'use server'

import { type Product } from '@/lib/types'
import { WalgreensInventory, WalgreensProduct, WalgreensStore } from './types'

import { getStoresNearMe, getStoreInventory, searchProducts, getProduct } from './api';

// Get api key
const apiKey = process.env['WALGREENS_API_KEY'] || ''

const auth = {
    apiKey: apiKey,
    affId: "storesapi"
}

const priceRegex = /\$(\d*\.?\d+?)/

// Create a product item standardised with other products
async function createProduct(item: WalgreensInventory) : Promise<Product | void>
{

    const response = await getProduct(item.id)
    const products: WalgreensProduct[] = response.data?.products || []
    const productInfo = products[0]?.productInfo
    console.log(productInfo)
   
    // Check if we found a product with information
    if (!productInfo) {  return }

    // Get size and unit
    let [, size, unit ] = productInfo.productSize.match(/\s*([\d\s\/.]*)\s*(.*)/) || [];
    if (!unit) unit = productInfo.unitPriceSize

    let priceInfo = productInfo.priceInfo

    // Get prices
    let [, sPrice ] = priceInfo.salePrice.match(priceRegex) || [, 0 ]
    let salePrice = Number(sPrice)

    let [, rPrice ]= priceInfo.regularPrice.match(priceRegex) || [, 0 ]
    let regularPrice = Number(rPrice)

    return {
        upc: productInfo.upc,
        id: `walgreens.${productInfo.prodId}`,
        description: productInfo.productDisplayName,
        category: productInfo.productType,
        price: (priceInfo.onSale) ? salePrice : regularPrice,
        size: Number(size),
        unit: unit,
        brand: productInfo.subBrandName !== '' ? productInfo.subBrandName : 'walgreens',
        priority: 0,
        hotness: 0,
        availability: [{ 
            priceLower: salePrice,
            priceUpper: regularPrice
        }],
        availableOnline: productInfo.shippingEnabled,
        url: `https://www.walgreens.com/${productInfo.productURL}`,
        imageUrl: productInfo.imageUrl // quicklookURL
    }
}

export async function getProductsForStore(store: string, term: string) {
    
    // Get the store's inventory
    console.log(term)
    let productResponse = await searchProducts(undefined, term, store);
    console.log(productResponse.data)

    //let inventoryResponse = await getStoreInventory(auth, store);
    let inventory = [{ id:"prod12389500", s:0, q:1, ut:0 }] // inventoryResponse.data

    // Get all items in stock
    let items = inventory.filter((item: WalgreensInventory) => item.q > 0)
        .map(async (item: WalgreensInventory) => await createProduct(item))

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
    return await searchStores(stores.slice(0, 1), term[0])

}