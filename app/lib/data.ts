import { fade } from 'svelte/transition';
import LoadingCard from './LoadingCard.svelte';
/**
 * @type {{title: string, description: string}}
 */
export let recommendation;

async function getRecommendationInfo() {
    const response = await fetch('/api/getMediaDetails', {
        method: 'POST',
        body: JSON.stringify({ title: recommendation.title }),
        headers: {
            'content-type': 'application/json'
        }
    });
    let recommendationDetails = await response.json();

    return recommendationDetails;
}

let promise = getRecommendationInfo();