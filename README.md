# Cryptozoologica

A web app for people who take cryptids half-seriously. You look up a creature, the app writes a field journal entry about it (sourced from real search results, not hallucinated), draws a sketch in brown ink on parchment, and pins sighting locations on a map. You can talk to a fictional cryptozoologist named Dr. Thorne, run a live voice session in English or Spanish, upload photos for "specimen analysis," and keep a personal log of your own sightings.

Everything runs on Google's Gemini API. The journal entries, sketches, voice sessions, chat, and image analysis each use a different model. All the generated text goes through a writing style filter that keeps it from reading like a brochure or a LinkedIn post.

## What it actually does

The app has five sections, each on its own tab:

**Field Journal** searches a cryptid by name, pulls real information via Google Search grounding, and formats it as a handwritten-looking journal page. Each search also generates a field sketch automatically. There are 15 pre-loaded cryptids (Chupacabra, Mothman, Bigfoot, Nessie, etc.) you can browse without typing anything. Entries can be saved to your personal collection and recalled later from an archive overlay.

**Expedition Map** takes coordinates or a location name and returns what cryptids have been reported nearby, again using search grounding. You can save locations to Firestore for later reference. Clicking a cryptid name in the map results jumps you to the Field Journal with that creature pre-searched.

**Research Lab** has three modes. "Consult Dr. Thorne" is a chat with an opinionated AI cryptozoologist who will tell you if he thinks a sighting is credible or not. "Field Sketcher" lets you describe a creature in your own words and generates an ink-on-parchment drawing from that description. "Specimen Analysis" takes a photo upload and attempts to identify what's in it.

**Cryptid Live** opens a real-time voice channel using the Gemini Live API. Hold a button to talk, release to hear a response. There's a language toggle for English and Spanish. You can generate a sketch from whatever the AI was just talking about.

**My Observations** is a personal journal with three sub-tabs: sightings you've logged yourself, saved field notes from your searches, and bookmarked map locations. Everything is stored per-user in Firestore.

## Models used

Each feature uses a specific Gemini model:

| Feature | Model |
|---|---|
| Journal entries, map search | gemini-3-flash-preview |
| Field sketches | gemini-3.1-flash-image-preview |
| Dr. Thorne chat, specimen ID | gemini-3.1-pro-preview |
| Text-to-speech narration | gemini-2.5-flash-preview-tts |
| Live voice sessions | gemini-3.1-flash-live-preview |

## The writing style system

All generated text passes through a set of anti-trope rules injected as system instructions. The rules ban specific overused words (delve, tapestry, robust, leverage, and about 30 others), prohibit common AI structural patterns (the "It's not X, it's Y" reframe, self-answered rhetorical questions, groups-of-three defaults, excessive em dashes), and require concrete details like real place names and dates instead of vague generalizations.

The rules live in `src/constants/writing-style.ts` as a compact constant (~400 tokens) that gets prepended to every text-generating system instruction. There are English and Spanish variants. Image generation prompts don't get the writing rules since they're visual instructions, not prose.

This keeps the context overhead small. The rules are processed once as system instructions and cached by the model, so they don't slow anything down or inflate the per-request token count.

## Run it locally

You need Node.js 18+ and a Gemini API key.

```
npm install
```

Create a `.env` file in the root:

```
RESEARCH="your-gemini-api-key"
```

The `RESEARCH` variable is the primary key. There's a `GEMINI_API_KEY` fallback if `RESEARCH` isn't set. Get a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

```
npm run dev
```

Opens on http://localhost:3000. Sign in with Google to use the personal journal features (Firebase Auth).

## Deploy to Cloudflare Pages

The repo is set up for Cloudflare Pages with automatic deploys on push.

1. Connect the GitHub repo in the Cloudflare dashboard (Workers & Pages > Create > Pages > Connect to Git)
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add `RESEARCH` as an environment variable with your Gemini key
5. Every push to `main` deploys automatically

## Tech

React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4. Firebase for auth and Firestore. Gemini API via `@google/genai`. Deployed on Cloudflare Pages. The UI is styled to look like an aged field journal with five different document styles (typewriter, handwritten, newspaper, scanned, photocopy).

## Project structure

```
src/
  constants/
    cryptids.ts          15 pre-loaded cryptid entries
    writing-style.ts     anti-trope rules for text generation
  services/
    gemini.ts            all Gemini API calls (search, sketch, chat, TTS, live)
  components/
    FieldJournal.tsx      cryptid search + journal display + archive
    ExpeditionMap.tsx     location-based cryptid search + map
    ResearchLab.tsx       chat, sketcher, specimen analysis
    CryptidLive.tsx       real-time voice session
    MyObservations.tsx    personal sightings, saved entries, locations
    JournalLayout.tsx     sidebar nav, mobile nav, auth
    CryptidLink.tsx       clickable cryptid name links
    FundingGuard.tsx      API key validation gate
    VoiceSearchButton.tsx push-to-talk via Web Speech API
  lib/
    firebase.ts           Firebase config and initialization
    utils.ts              cn() classname utility
```
