# Cryptozoologica — The Cryptid Journal

A scientific expedition journal for cryptozoologists. Research cryptids with AI-powered field notes, explore sighting locations on an interactive map, generate scientific sketches, and log your own observations.

## Features

- **Field Journal** — Search any cryptid and get a detailed scientific journal entry powered by Gemini AI with Google Search grounding
- **Expedition Map** — Discover cryptids reported near any coordinates, backed by Google Maps grounding
- **Research Lab** — Generate hand-drawn scientific field sketches of cryptids using Gemini image generation
- **My Observations** — Log and manage personal field sightings stored in Firebase Firestore
- **Cryptid Live** — Real-time cryptid research and conversation

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Vite 6
- **AI:** Gemini API (`@google/genai`) — search, maps grounding, and image generation
- **Backend:** Firebase Auth (Google sign-in) + Firestore
- **Deployment:** Cloudflare Pages

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```
   npm install
   ```
2. Create a `.env` file with your Gemini API key:
   ```
   GEMINI_API_KEY="your-api-key-here"
   ```
   Get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
3. Start the dev server:
   ```
   npm run dev
   ```
4. Open **http://localhost:3000**

## Deploy

This repo is configured for **Cloudflare Pages** with git-based deployments.

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variable:** Set `GEMINI_API_KEY` in the Cloudflare Pages dashboard

Every push to `main` triggers an automatic production deployment.
