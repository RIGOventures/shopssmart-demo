'use server'

import { ResultCode } from '@/lib/utils/result'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { z } from 'zod'
import { kv } from '@vercel/kv'

const UpdateSchema = z.object({
    lifestyle: z.string().nullable(),
    allergen: z.string().nullable(),
    health: z.string().nullable(),
});

export async function updatePreferences(email: string, prevState: {}, formData: FormData) {
    const rawFormData = {
        lifestyle: formData.get('lifestyle'),
        allergen: formData.get('allergen') || 'None',
        health: formData.get('health'),
    };

    const validatedFields = UpdateSchema.safeParse(rawFormData);
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            type: 'error',
            resultCode: ResultCode.InvalidSubmission,
            message: 'Missing Fields. Failed to Edit Preferences.',
        };
    }

    const { lifestyle, allergen, health } = validatedFields.data;

    const preferences = {
        lifestyle: lifestyle,
        allergen: allergen,
        health: health,
    } 

    console.log(preferences)
    await kv.hset(`user:preferences:${email}`, preferences)

    revalidatePath('/')
    redirect('/')
}

export async function getPreferences(email: string) {
	try {
		const pref = await kv.hgetall(`user:preferences:${email}`)
  		return pref
	} catch (error) {
		console.error('Failed to fetch user:', error);
		throw new Error('Failed to fetch user.');
	}
}