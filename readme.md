# Formatly

A greenfield utility for converting, compressing, and managing files across web and mobile.

The web app is published through GitHub Pages at https://ranamrameez.github.io/formatly/ after changes to `webapp/` are pushed to `main`.

## Product Direction

File Utility will help people process documents and images without juggling separate tools. The core workflow is intentionally simple:

1. Select one or more files.
2. Choose a conversion format or compression profile.
3. Process the batch with visible per-file progress.
4. Preview results and download one file or the complete batch.

## Planned Features

- Multi-file drag-and-drop and file-picker input.
- Conversion between supported document and image formats.
- Browser-side image input support for PDF, JPG/JPEG, PNG, WebP, GIF, BMP, AVIF, and SVG when the browser can decode the file.
- Browser-side output support for PNG, JPG, JPEG, WebP, and PDF for image inputs.
- Processing modes include Convert, Compress, and Compress & Convert.
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

## New PC Setup

These instructions target Windows PowerShell.

### 1. Install prerequisites

Install the following tools:

- Git: https://git-scm.com/download/win
- Node.js 22 LTS: https://nodejs.org/
- VS Code: https://code.visualstudio.com/

Verify the installations:

```powershell
git --version
node --version
npm.cmd --version
```

The Node.js version should be 22 or newer. Restart VS Code after installing Node.js if the commands are not found.

### 2. Clone the repository

Replace the URL with the repository URL from GitHub:

```powershell
git clone <repository-url> FileConverter
Set-Location FileConverter
```

If the repository is already on the computer:

```powershell
Set-Location D:\Coding\FileConverter
git pull
```

### 3. Install web dependencies

Install dependencies from the committed lockfile:

```powershell
Set-Location webapp
npm.cmd ci
```

Use `npm.cmd` in PowerShell when the execution policy blocks `npm.ps1`.

### 4. Start the development server

```powershell
npm.cmd run dev
```

Open the URL shown in the terminal, usually:

```text
http://localhost:5173
```

Keep the terminal running while developing. Press `Ctrl+C` to stop the server.

### 5. Validate changes

Run these commands from `webapp/` before committing:

```powershell
npm.cmd run lint
npm.cmd run build
```

### 6. Preview a production build

```powershell
npm.cmd run build
npm.cmd run preview
```

The preview server serves the production build locally.

## Web Development

```powershell
npm.cmd --prefix webapp ci
npm.cmd --prefix webapp run dev
npm.cmd --prefix webapp run lint
npm.cmd --prefix webapp run build
```

See [webapp/AI_README.md](webapp/AI_README.md), [android/AI_README.md](android/AI_README.md), and [api/readme.md](api/readme.md) for platform boundaries.
