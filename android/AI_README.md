# Android AI Guide

## Current State

This folder is a planned Android client. Do not assume a Gradle project exists yet. Establish the app architecture and shared API contract before adding platform code.

## Product Responsibilities

- Select documents and images from the device gallery.
- Capture images when a camera input is useful and permissions are granted.
- Submit multiple files to the shared conversion or compression flow.
- Show per-file and batch progress with recoverable errors.
- Preview outputs and support saving or sharing individual files or a batch.

## Implementation Plan

1. Choose the Android UI and networking stack used by the project.
2. Create the Gradle project with debug and release variants.
3. Define the API client from the contract in `api/`.
4. Add camera/gallery input, permissions, progress, preview, and sharing.
5. Add unit, instrumentation, and release-build checks.

## AI Contribution Rules

- Keep mobile-specific code inside `android/`.
- Prefer platform APIs and established Android libraries over custom implementations.
- Treat files and permissions as failure-prone: handle cancellation, denial, oversized files, and network loss.
- Do not duplicate conversion logic in the client; the processing contract belongs to the shared pipeline/API.
- Update this file when the build commands or architecture become concrete.

## CI Contract

The Android workflow runs when files under `android/` change. Until the Gradle project exists, CI should perform repository/documentation checks rather than pretend to build an application.
