// names is a list of keys you want to keep
export function removeAllExcept(arr: any[], names: string[]) { 
    arr.forEach((item) => {
        Object.keys(item).forEach(key => {
            if (!names.includes(key)) {
                delete item[key]
            }
        })
    })
}

// Get an element with a field that matches a value
export function getItemByValue(arr: any[], key: string, value: any) {
    return arr.find(item => item[key] === value);
}