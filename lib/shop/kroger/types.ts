export * from './types-product';
export * from './types-location';

export type LocationIdParams = {
    "filter.locationId"?: string,
}

export type SearchParams = LocationIdParams & { 
    "filter.term": string,
    "filter.brand"?: string,
    "filter.fulfillment"?: string,
    "filter.start"?: number,
}

export type StoreLocationParams = {
    "filter.lat.near": number,
    "filter.lon.near": number,
    "filter.radiusInMiles": number,
}