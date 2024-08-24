export type WalgreensInventory = {
    id: number | string // PRODUCT_ARTICLE_ID,
    s: number // STORE_NUMBER,
    q: number // QUANTITY_IN_STOCK,
    ut: number // UPDATE_TIME_EPOCH
}

type PriceInfo = {
    regularPrice: string, // $8.49
    regularPriceHtml: string,
    salePrice: string, //$5.49
    salePriceHtml: string,
    onSale: boolean,
    singleUnitSalePrice: string
}

type ProductInfo = {
    upc: string,
    storeUPC: string,
    gtin: string,

    // Ids
    articleId: string,
    prodId: string,
    skuId: string,

    // Urls
    imageUrl: string,
    productURL: string,
    reviewURL: string,
    imageUrl450: string,
    imageUrl50: string,
    quicklookURL: string,

    // Details
    productName: string,
    productDisplayName: string,
    productSize: string, // "1 ea "
    productType: string,
    size: [],
    storeInv: string,

    unitPrice: string, // "9999999"
    unitPriceSize: string, // "ea"
    
    retailUnitQty: string,

    priceInfo: PriceInfo,
    averageRating: string,

    subBrandName: string,
    beautyCategoryName: string
    
    isAgeRestricted: boolean
    excludeLocalDelivery: boolean
    temperatureCode: [ { key: string, valye: string } ],

    sdpEnabled: boolean
    shippingEnabled: boolean
    
    channelAvailabilityPrdCard: { 
        findAtStore: true, 
        outOfStockOnline: true 
    },

    rebateMessage: { 
        rebateText: string,
        type: string, 
        message: string,
        url: string,
    },
}

export interface WalgreensProduct {
    productInfo: ProductInfo    
}