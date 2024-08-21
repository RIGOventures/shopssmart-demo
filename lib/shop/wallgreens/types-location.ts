export type MealBreak = {
    startTime: string
    endTime: string
    message: string
    status: string
}

export type Service = {}

export type PhoneNumber = {
    number: string
    areaCode: string
    faxNumber: string
    type: string
}

export interface WalgreensStore {
    storeNumber: string
    longitude: string
	latitude: string
    distance: number
	storeSeoUrl: string
	mapUr: string
	photoInd: string
	curbSideClose: string
	sdp: string
	sdd: string
	sts: string

	//New Emergency Enhancement fields
	emerActiveInd: string, // Y / N
	emerStatusCode: number,
	emerStatusValue: string,
	emerTypeCode: number,
	emerTypeValue: string,
	emerFEDeptInd: string, // Y / N
	emerRXDeptInd: string, // Y / N

    store:{
        storeType: string
        storeNumber: string
        telepharmacyKiosk: string
        name: string
        brand: string
        storeBrand: string
        storeOpenTime: string
        storeCloseTime: string
        pharmacyOpenTime: string
        pharmacyCloseTime: string
        timeZone: string
        address: {
            zip: string
            locationName: string
            city: string
            street: string
            intersection: string
            county: string
            state: string
        },
        serviceIndicators: Service[],
        pharmacyMealBreak: MealBreak[],
        phone: PhoneNumber
    }
}