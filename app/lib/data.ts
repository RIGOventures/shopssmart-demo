async function getRecommendationInfo(item: string) {
    const response = await fetch('/api/getDetails', {
        method: 'POST',
        body: JSON.stringify({ item: item }),
        headers: {
            'content-type': 'application/json'
        }
    });
    let recommendationDetails = await response.json();

    return recommendationDetails;
}
