# GTCRN Public Portfolio Implementation Plan

> For agentic workers: the supplied user plan is already approved. Implement natively with the tools available in this session; companion Superpowers execution skills are not installed.

**Goal:** Restore public access to the curated GTCRN portfolio through GitHub Pages.

**Architecture:** A static React application reuses the existing public components. A read-only adapter maps the former catalog/case API routes to local JSON and adds the project base path to asset URLs. Experimental bytes remain unchanged.

**Tech Stack:** React, TypeScript, Vite, Node.js 24, GitHub Pages Actions.

**Spec:** [SPEC.md](SPEC.md)

## Global Constraints

- Original algorithm repository remains private; only curated display assets enter the new public repository.
- Fixed E4 seed17 and all 13 batches, 3 cases and 9 WAVs remain byte-identical.
- Local execution, public browsing, real soundcard and microphone verification remain distinct.

## Review Focus

- Project subpath must work for every audio, evidence, script and stylesheet URL.
- HTML errors cannot become experimental JSON; transient failures must permit manual retry.
- Negative controls, null scores, model hashes and untested capability states must survive export.
- Concurrent case selection must not replace the active view with a stale result.
- Public publication must exclude credentials, raw data, weights, caches and local diagnostic logs.

## Tasks

- [x] Copy only approved public snapshot assets; bind exact source bytes with a manifest.
- [x] Adapt public components and read-only data access; replace cloud-workspace links with a local demonstration guide.
- [x] Add base-path, error, concurrency and snapshot-identity tests; compile the standalone application.
- [x] Audit staged files, push the public source, configure Pages and deploy through Actions.
- [x] Verify the actual public URL, resource hashes, evidence links and partial audio delivery; record browser limits independently.
