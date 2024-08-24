export * from './types-product';
export * from './types-location';

type BaseBody = {
    apiKey: string
	affId: string
}

export type StoreLocationBody = BaseBody & {
    lat: number,
    lng: number,
    s: number,
    p: number,
    r: number,
    requestType: string
}