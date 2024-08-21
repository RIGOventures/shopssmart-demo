import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { z } from 'zod'
import { kv } from '@vercel/kv'

const UpdateSchema = z.object({
    lifestyle: z.string(),
    allergen: z.string(),
    health: z.string(),
});

export async function updatePreferences(email: string, prevState: {}, formData: FormData) {
    const rawFormData = {
        lifestyle: formData.get('lifestyle'),
        allergen: formData.get('allergen'),
        health: formData.get('health'),
    };

    const validatedFields = UpdateSchema.safeParse(rawFormData);
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Edit Preferences.',
        };
    }

    const { lifestyle, allergen, health } = validatedFields.data;

    const preferences = {
        lifestyle: lifestyle,
        allergen: allergen,
        health: health,
    } 

    await kv.hset(`user:preferences:${email}`, preferences)

    revalidatePath('/')
    redirect('/')
}