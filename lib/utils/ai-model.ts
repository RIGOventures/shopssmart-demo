// Design model prompt
const prompt = `\
    You are a grocery shopping conversation bot and you help recommend users to buy certain groceries.
    You and the user can discuss reasons to buy certain groceries, in the UI.
    
    If the user wants to buy groceries, or complete another impossible task, respond that you are a demo and cannot do that.
    
    Besides that, you cannot interact with the user.
    Thank you for your help! It's greatly appreciated.`


export function createPrompt() {
    return prompt
}

export function createMessage(
	groceryType: string, 
    availableProducts?: string,
	selectedCategories?: string, 
	specificDescriptors?: string
) {
	let fullSearchCriteria = `Pick one ${groceryType} recommendation`
    + `${
            availableProducts ? 
            `from the list of related products: ${availableProducts}` : 
            ''
        }. `
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
    + `Please only respond with the ${groceryType}'s name, then on the next line, a brief reason for picking that ${groceryType}. `
	+ `Finally, add a line that includes the link. `
    + `Please make sure there is a blank line between each part of this.`
    + `If there are no products listed to recommend, recommend that the user increase the search radius.`
    + `Thank you very much!`

	return fullSearchCriteria
}