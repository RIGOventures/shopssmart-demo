export interface DeliverooStore {
    id: string
    distance: number
    estimate_duration: {
        begin: string
        end: string
    }
    location: {
        lat: number
        lon: number
    }
    name: string
    display_name: string
    status: string
    delivery_free: {
        currency_code: string
        fractional: number
    }
    visible: boolean
}