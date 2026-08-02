# Reconstruction Hub — Frontend

React + TypeScript + Vite frontend for Reconstruction Hub. Structure follows
`CLAUDE-WORKFLOW.md` §2.1 (feature-based). Ported from the `REHUB WORK V8.html`
single-file prototype — see `S2-FE-01`.

## Develop

```bash
npm install
npm run dev
```

## Build / lint / format

```bash
npm run build
npm run lint
npm run format:check
```

## Docker

```bash
docker build -t reconstruction-hub-frontend .
docker run -p 8080:80 reconstruction-hub-frontend
```
