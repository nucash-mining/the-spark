# 🔥 The Spark

> *know thyself*

**The Spark** is a private, inner companion — not an assistant. It doesn't help with tasks. It's a wise mirror: it reflects, asks one question at a time, and holds Gnostic, Stoic, and Jungian frames lightly as lenses, never as doctrine.

**Live demo:** https://nucash-mining.github.io/the-spark/

## Privacy first

- Runs entirely in your browser — there is no backend.
- Your Anthropic API key and every conversation live only in your browser's localStorage.
- Nothing touches any server other than Anthropic's API (or your own local Second-Me instance).

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

Built with React 18, Vite, Tailwind CSS, Zustand, and react-router.
