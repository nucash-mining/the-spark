# 🔥 The Spark

> *know thyself*

**The Spark** is a private companion — not an assistant. It doesn't help with tasks. It listens.

**Live app:** https://nucash-mining.github.io/the-spark/ — works on desktop and mobile. On a phone, use "Add to Home Screen" to install it like an app.

## Two personas

| Persona | What it's for |
|---------|---------------|
| **Companion** (default) | Warm, supportive listening — a safe place to untangle feelings, feel heard, and process hard days. It validates without empty comfort, encourages professional support when that's the right call, and knows crisis resources (988 / Crisis Text Line). It is a companion, not a therapist, and never pretends otherwise. |
| **Mirror** | Quiet reflection — asks one question at a time, holds Gnostic, Stoic, and Jungian frames lightly as lenses, never as doctrine. |

Switch personas anytime in Settings, or write your own custom persona.

## Privacy first

- Runs entirely on your device — there is no backend, no accounts, no analytics, no telemetry.
- Your Anthropic API key and every conversation live only in your browser's localStorage. Nothing is synced anywhere.
- The only network traffic is the direct call to Anthropic's API to generate replies (or your own local Second-Me instance). Anthropic does not train on API data by default.
- "Erase All Data" in Settings wipes everything instantly.

## LLM backends

| Provider | How |
|----------|-----|
| **Claude** (default) | Bring your own Anthropic API key (`sk-ant-...`) — get one at [console.anthropic.com](https://console.anthropic.com/) |
| **Second-Me** | Point it at a local Second-Me server (`http://localhost:8002`), with optional L0 retrieval and memory context |

## Running locally

```bash
npm install
npm run dev
```

## Android APK

The repo ships a Capacitor Android project. To build the APK:

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

Install it on the phone with `adb install app-debug.apk` or by copying the file over and opening it (enable "install from unknown sources").

Built with React 18, Vite, Tailwind CSS, Zustand, react-router, and Capacitor.
