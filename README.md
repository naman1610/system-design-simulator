# Generative System Design Simulator

An AI-powered interactive simulator that generates high-level system design diagrams (for prompts like `Design Netflix`), then lets you run traffic/load simulations, detect bottlenecks, tune component parameters, and export architecture artifacts.

## What This Project Does

The simulator combines three workflows in one UI:

1. **Generate architecture from a prompt**
	 The backend calls Gemini (`gemini-2.5-flash`) and validates output against a strict Zod schema.

2. **Visualize and edit the design graph**
	 The result is rendered in React Flow with draggable nodes and drag-and-drop component templates.

3. **Simulate system behavior under load**
	 A simulation engine estimates latency, throughput, node utilization, bottlenecks, saturation point, scaling curve, and monthly cost.

## Key Features

- Prompt-to-architecture generation via Gemini JSON mode
- Robust schema validation + retry logic for malformed model output
- Interactive React Flow canvas with custom node types and minimap
- Drag-and-drop template palette (11 infrastructure component types)
- Right sidebar tabs for:
	- Simulation controls and results
	- Node details and parameter tuning
	- Latency/scaling charts
	- Cost analysis panel
- Full-diagram PNG export (captures entire graph, not only visible viewport)
- Mermaid export (copy-to-clipboard)
- Local history persistence (up to 50 designs via localStorage)
- Dark mode support (`next-themes`)
- Resizable left and right sidebars

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS v4, shadcn/ui, Radix primitives, lucide-react
- **Diagramming**: React Flow (`@xyflow/react`)
- **State**: Zustand
- **Charts**: Recharts
- **AI**: Google Gemini (`@google/generative-ai`)
- **Validation**: Zod v4
- **Layout/Graph tooling**: Dagre
- **Export**: html-to-image + Mermaid text generation

## Architecture Overview

### Frontend

- `src/components/layout/DesignWorkspace.tsx`
	Main shell containing prompt input, canvas, sidebars, tabs, history, export, and theme toggle.

- `src/components/canvas/DesignCanvas.tsx`
	React Flow canvas with node/edge updates, drop handling, controls, minimap, and instance registration for export.

- `src/components/panels/*`
	Domain-specific UI panels for prompting, simulation, traffic estimates, node details, costing, templates, and history.

- `src/stores/*`
	Zustand stores for design graph state, simulation config/result state, and persisted history.

### Backend/API

- `src/app/api/generate/route.ts`
	Server route that:
	1. applies a simple in-memory rate limit,
	2. validates prompt payload,
	3. runs generation pipeline,
	4. returns normalized design JSON.

- `src/lib/ai/*`
	Prompting, Gemini call wrapper, Zod schema, parsing, retries, and transformation to React Flow node/edge models.

### Simulation Engine

- `src/lib/simulation/index.ts`
	Orchestrates bottleneck detection, latency estimation, throughput modeling, scaling curve generation, saturation search, and cost estimation.

## Prerequisites

- Node.js **20+** recommended
- npm (project currently uses `package-lock.json`)
- Gemini API key from Google AI Studio

## Setup and Run

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment variables**

Create `.env.local` in project root:

```dotenv
GEMINI_API_KEY=your_real_gemini_api_key
```

3. **Start development server**

```bash
npm run dev
```

4. **Open app**

Visit `http://localhost:3000`.

## Available Scripts

- `npm run dev` - start local dev server
- `npm run build` - create production build
- `npm run start` - run production server
- `npm run lint` - run ESLint

## How To Use

1. Enter a design prompt (example: `Design Netflix`).
2. Wait for AI generation to produce nodes/edges and explanation.
3. Use the left component palette to drag additional components onto the canvas.
4. Click any node to tune parameters (replicas, latency, throughput, cost, etc.).
5. Run/adjust simulation to inspect bottlenecks and performance metrics.
6. Open charts and costs tabs for scaling and spend analysis.
7. Export:
	 - PNG: downloads full architecture image.
	 - Mermaid: copies diagram DSL text to clipboard.
8. Use history panel to reopen or remove prior generated designs.

## API Contract

### `POST /api/generate`

Request:

```json
{
	"prompt": "Design Netflix"
}
```

Validation/constraints:

- `prompt` must be a non-empty string
- max prompt length: **500 characters**
- simple in-memory rate limit: **10 requests/minute per IP key**

Error codes:

- `400` invalid payload
- `429` rate limit exceeded
- `500` generation or validation failure

## Data and Persistence

- Design history is stored in browser localStorage under `sds-history`.
- Up to 50 entries are kept (oldest entries are dropped).
- This persistence is local to each browser profile/device.

## Notes and Limitations

- Current rate limiting is in-memory (resets on server restart and is instance-local).
- Cost and latency models are heuristic approximations, not cloud-provider billing calculators.
- AI output quality depends on prompt clarity and model behavior.
- Supabase auth/storage integration is planned but not yet active in current code.

## Deployment

This app is compatible with Vercel.

1. Import repository into Vercel.
2. Set `GEMINI_API_KEY` in Vercel project environment variables.
3. Deploy with standard Next.js build settings.

## Suggested Prompt Examples

- `Design YouTube with upload pipeline and video transcoding`
- `Design Uber with geo-search and surge pricing`
- `Design WhatsApp with group messaging and delivery receipts`
- `Design e-commerce checkout with inventory and payment service`

## Security Reminder

- Never commit real API keys.
- Keep `GEMINI_API_KEY` only in local/hosted environment variables.
