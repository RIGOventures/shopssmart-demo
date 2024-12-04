# How it works

This project uses the Google Vertex API (specfically, gemini-1.5-flash) and Vercel Edge functions with streaming. It generates grocery recommendations based on user preferences, sends it to the Vertex API via a Vercel Edge function, then streams the response back to the application.

# Running Locally

After cloning the repo, create a `.env` file based on `.env.example`, following its instructions. You can ignore adding any API Keys since
they are not core to any functionality.

For example:

`AUTH_SECRET=...`

Then, run the application in the command line and it will be available at http://localhost:3000.

`pnpm run dev`

# Testing

Create a `.env.test.local` file based on `.env` and change the keys based on the testing environment you are trying to create.
