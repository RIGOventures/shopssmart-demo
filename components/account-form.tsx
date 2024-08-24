'use client';

import { User } from '@/lib/types';

import { useFormState } from 'react-dom'

import {
	HeartIcon,
	UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { updatePreferences } from '@/app/account/actions';

export default function EditAccountForm({
	user,
	lifestyles,
	allergens
}: {
	user: User;
	lifestyles: string[];
	allergens: string[]
}) {

	const initialState = { message: '', errors: {} };
	const updatePreferencesWithEmail = updatePreferences.bind(null, user.email);
	const [state, formAction] = useFormState(updatePreferencesWithEmail, initialState);

	return (
		<form action={formAction}>
			<div className="rounded-md p-4 md:p-6">

				{/* Lifestyle Name */}
				<div className="mb-4">
					<label htmlFor="customer" className="mb-2 block text-sm font-medium">
						Choose diet plan or lifestyle
					</label>
					<div className="relative">
						<select
							id="lifestyle"
							name="lifestyle"
							className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
							defaultValue={''}
						>
						<option value="" disabled>
							Select a lifestyle
						</option>
							{lifestyles.map((lifestyle) => (
								<option key={lifestyle} value={lifestyle}>
									{lifestyle}
								</option>
							))}
						</select>
						<UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
					</div>
				</div>

				{/* Allergen Name */}
				<div className="mb-4">
					<label htmlFor="customer" className="mb-2 block text-sm font-medium">
						Choose an allergen
					</label>
					<div className="relative">
						<select
							id="allergen"
							name="allergen"
							className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
							defaultValue={''}
						>
						<option value="" disabled>
							Select an allergen
						</option>
							{allergens.map((allergen) => (
								<option key={allergen} value={allergen}>
									{allergen}
								</option>
							))}
						</select>
						<UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
					</div>
				</div>

				{/* Health Conditions */}
				<fieldset>
					<legend className="mb-2 block text-sm font-medium">
						Are there any specific health conditions or dietary restrictions you’d like us to consider when recommending products?
					</legend>
					<div className="relative mt-2 rounded-md">
						<div className="relative">
							<input
								id="health"
								name="health"
								type="text"
								defaultValue={''}
								placeholder="Enter dietary restriction"
								className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
							/>
							<HeartIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
						</div>
					</div>
				</fieldset>
			</div>
			<div className="mt-6 flex justify-end gap-4">
				<Link
					href="/"
					className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
				>
					Cancel
				</Link>
					<button type="submit">Edit Preferences</button>
			</div>
		</form>
	);
}
