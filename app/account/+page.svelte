<script>
	import * as animateScroll from 'svelte-scrollto';
	import { fade } from 'svelte/transition';
	import Form from '$lib/Form.svelte';
	import RecommendationCard from '$lib/RecommendationCard.svelte';
	import { onMount } from 'svelte';
	import LoadingCard from '$lib/LoadingCard.svelte';
	let loading = false;
	let error = '';
	let endStream = false;
	let makeRecommendation = false;

	/**
	 * @type {string}
	 */
	let searchResponse = '';
	/**
	 * @type {Array<string | {title: string, description: string}>}
	 */
	let recommendations = [];

	/**
	 * @param {string} target
	 */

	$: {
		if (searchResponse) {
			let lastLength = recommendations.length;
			let x = searchResponse?.split('\n');
			recommendations = x.map((d, i) => {
				if ((x.length - 1 > i || endStream) && d !== '') {
					// @ts-ignore
					const [, title, description] = d.match(/\d\.\s*(.*?):\s*(.*)/);
					return { title, description };
				} else {
					return d;
				}
			});
			if (recommendations.length > lastLength) {
				animateScroll.scrollToBottom({ duration: 1500 });
			}
		}
	}

	/**
	 * @type {string}
	 */
	let cinemaType = 'tv show';
	/**
	 * @type {Array<string>}
	 */
	let selectedCategories = [];
	let specificDescriptors = '';

	async function search() {
		if (loading) return;
		recommendations = [];
		searchResponse = '';
		endStream = false;
		loading = true;

		

		if (response.ok) {
			try {
				const data = response.body;
				if (!data) {
					return;
				}

				const reader = data.getReader();
				const decoder = new TextDecoder();

				while (true) {
					const { value, done } = await reader.read();
					const chunkValue = decoder.decode(value);

					searchResponse += chunkValue;

					if (done) {
						endStream = true;
						break;
					}
				}
			} catch (err) {
				error = 'Looks like OpenAI timed out :(';
			}
		} else {
			error = await response.text();
		}
		loading = false;
	}
	function clearForm() {
		recommendations = [];
		searchResponse = '';
		endStream = false;
		cinemaType = 'tv show';
		selectedCategories = [];
		specificDescriptors = '';
	}
</script>

<div>
	<div class="h-screen w-full bg-cover fixed" style="background-image: url(/background.png)">
		<div
			class={`${
				makeRecommendation ? 'backdrop-blur-md' : ''
			}  flex flex-col items-center justify-center min-h-screen w-full h-full bg-gradient-to-br from-slate-900/80 to-black/90`}
		/>
	</div>

	<div class="absolute inset-0 px-6 flex flex-col h-screen overflor-auto">
		<div in:fade|global class="w-full max-w-4xl mx-auto">
			<div class="w-full mb-8">
				<Form
					bind:cinemaType
					bind:selectedCategories
					bind:loading
					bind:specificDescriptors
					on:click={search}
				/>
		</div>

	</div>
</div>
