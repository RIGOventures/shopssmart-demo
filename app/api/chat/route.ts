import { LanguageModelV1 } from '@ai-sdk/provider';
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth'
type Client = JSONClient & { scopes: string | [string] }
import { Chat, Message } from '@/lib/types'

import { getGCPCredentials } from './utils/env-auth';
import { auth } from 'google-auth-library';
import { auth } from '@/auth'

import { createVertex } from '@ai-sdk/google-vertex'
import { createInstruction, createPrompt } from '@/lib/utils/ai-model'

import { streamText, convertToCoreMessages } from 'ai';

import { saveChat } from '@/app/actions'

// Create Google gemini model
let model: LanguageModelV1;

getGCPCredentials().then((credentials: any) => {
    // Create client
    const client = auth.fromJSON(credentials) as Client;
    client.scopes = ['https://www.googleapis.com/auth/cloud-platform']
    // Authenticate from credentials
    const vertex = createVertex({ googleAuthOptions: { authClient: client } });

    // Create model
    model = vertex('gemini-1.5-flash', {
        useSearchGrounding: true,
        safetySettings: [
            { category: 'HARM_CATEGORY_UNSPECIFIED', threshold: 'BLOCK_ONLY_HIGH' },
        ],
    });

})

// Create instruction
const modelInstruction = createInstruction();

export async function POST(request) {
    const { chatId, messages } = await request.json();

    const coreMessages = convertToCoreMessages(messages);

    const result = streamText({
        model: model,
        system: modelInstruction,
        messages: coreMessages,
        onFinish: async ({ responseMessages }) => {
            try {

                const session = await auth()

                if (session && session.user) {
                    let messages = [...coreMessages, ...responseMessages]

                    const createdAt = new Date()
                    const userId = session.user.id as string
                    const path = `/list/${chatId}`

                    const firstMessageContent = messages[0].content as string
                    const title = firstMessageContent.substring(0, 100)

                    const chat: Chat = {
                        id: chatId,
                        title,
                        userId,
                        createdAt,
                        messages,
                        path
                    }

                    await saveChat(chat)
                }
                
            } catch (error) {
                console.error('Failed to save chat');
            }
        },
    });

    return result.toDataStreamResponse();
}