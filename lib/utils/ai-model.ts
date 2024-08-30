
// https://ai.google.dev/gemini-api/docs/system-instructions?lang=node

// Create system instruction
const instruction = `\
    You are an assistant for grocery shoppers.
    You receive a product name with categories and descriptors and respond with a specific grocery item that match these descriptors.

    Your response must consist of the following parts:
    The name of the grocery item with with a short hyperlink to purchase the grocery item.
    A blank line.
    A brief reason for picking that grocery item.

    If you cannot find pick any products, suggest that the user change their preferences.

    You can access external websites or databases to get product information.
    Thank you for your help!`

export function createInstruction() {
    return instruction
}

export function createPrompt(
    groceryType: string, 
    selectedCategories?: string, 
	specificDescriptors?: string,
) {
    let fullSearchCriteria = `Suggest one ${groceryType} recommendation`
    + `${
            selectedCategories ? 
            `Make sure that is fits all of the following categories: ${selectedCategories}. ` : 
            ''
        }`
    + `${
            specificDescriptors? 
            `Make sure it fits the following description as well: ${specificDescriptors}. ` : 
            ''
        }`
    + `${
			selectedCategories || specificDescriptors? 
            `If you cannot pick a recommendation that fit these criteria perfectly, select the one that best matches. ` :
            ''
		}`

	return fullSearchCriteria
}

export function createPromptGivenProducts(
	groceryType: string, 
    availableProducts?: string,
	selectedCategories?: string, 
	specificDescriptors?: string,
) {
	let fullSearchCriteria = 
        `${
            availableProducts ? 
            `Use this list of related products: ${availableProducts}` : 
            ''
        }. `
    + createPrompt(groceryType, selectedCategories, specificDescriptors)

	return fullSearchCriteria
}