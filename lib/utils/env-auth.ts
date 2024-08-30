'use server'

const keysRequired = [
    'GOOGLE_VERTEX_PROJECT',
    'GOOGLE_VERTEX_LOCATION',
    'GOOGLE_APPLICATION_CREDENTIALS',
    'KROGER_CLIENT_ID',
    'KROGER_CLIENT_SECRET',
    'WALGREENS_API_KEY', 
    'SPOONACULAR_API_KEY', 
    'UPC_DATABASE_API_KEY', 
]

export async function getMissingKeys() {
    return keysRequired
        .map(key => (process.env[key] ? '' : key))
        .filter(key => key !== '')
}

export const getGCPCredentials = () => {
    // for Vercel, use environment variables
    return process.env.GCP_PRIVATE_KEY
      ? {
            credentials: {
                client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL!,
                private_key: process.env.GCP_PRIVATE_KEY,
            },
            projectId: process.env.GCP_PROJECT_ID!,
        }
        // for local development, defer to default
      : undefined;
  };