

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { z } from 'zod';
import bcrypt from 'bcrypt';

import { authConfig } from './auth.config';

import { getUser } from './app/login/actions'

const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
});

const LoginUser = UserSchema.omit({ id: true });

export const { auth, signIn, signOut } = NextAuth({
	...authConfig,
	providers: [
		Credentials({
			credentials: {
				email: {},
				password: {},
			},
			async authorize(credentials) {

				const validatedFields = LoginUser.safeParse(credentials);

				if (validatedFields.success) {
					const { email, password } = validatedFields.data;

					const user = await getUser(email);
					if (!user) return null;

					const passwordsMatch = await bcrypt.compare(password, user.password);
					if (passwordsMatch) return user;
				}
		
				return null;
			},
		}),
	],
});