# File Utility

A greenfield utility for converting, compressing, and managing files across web and mobile.

## Product Direction

File Utility will help people process documents and images without juggling separate tools. The core workflow is intentionally simple:

1. Select one or more files.
2. Choose a conversion format or compression profile.
3. Process the batch with visible per-file progress.
4. Preview results and download one file or the complete batch.

## Planned Features

- Multi-file drag-and-drop and file-picker input.
- Conversion between supported document and image formats.
- Compression with quality, size, and format controls.
- Batch queue with progress, retry, cancellation, and clear errors.
- Individual downloads and one-click batch download.
- Local-first processing where practical, with an API for heavier workloads.
- Responsive web experience and a native Android client.

## Repository Layout

| Folder | Purpose |
| --- | --- |
| `webapp/` | React + TypeScript + Vite web client |
| `android/` | Planned Android client |
| `api/` | Planned processing and job API |
| `.github/workflows/` | Platform-scoped CI workflows |

## Development Plan

### Phase 1: Foundation

- Define supported input/output formats and compression behavior.
- Establish shared job, file, progress, and error models.
- Add representative fixtures and automated tests.

### Phase 2: Web Workflow

- Build the batch queue and file lifecycle states.
- Add conversion, compression, previews, and downloads.
- Add accessibility, responsive behavior, and browser capability handling.

### Phase 3: Processing API

- Implement validation, conversion, compression, job status, and result delivery.
- Add limits, cleanup, observability, and secure file handling.

### Phase 4: Android Workflow

- Add gallery and camera input, batch processing, progress, previews, and sharing.
- Reuse the shared models and API contract.

### Phase 5: Release Quality

- Add end-to-end coverage, performance checks, packaging, and release automation.

## Web Development

```powershell
Set-Location webapp
npm install
npm run dev
npm run lint
npm run build
```

See [webapp/AI_README.md](webapp/AI_README.md), [android/AI_README.md](android/AI_README.md), and [api/readme.md](api/readme.md) for platform boundaries.
