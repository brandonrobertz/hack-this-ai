# Hack this AI

This is a series of challenges around hacking AI systems. It runs on a local LLM via Ollama.

There's two parts:
 - The frontend (written in Svelte)
 - The backend (Python falcon)

## Setup

First build the frontend:

```
cd frontend
npm install
npm run build
```

This will build all the assets so they can be served via the Python process.

Then setup the backend:

```
pip install -r requirements.txt
python ollama_server.py
```

You should be able to see it running at http://localhost:8000
