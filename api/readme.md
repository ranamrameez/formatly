# Processing API

This folder is the starting point for the shared processing service. It is intentionally empty of implementation until the product contract is defined.

## Responsibilities

- Validate file type, size, and batch limits.
- Accept conversion and compression jobs.
- Report per-file and batch progress.
- Return structured errors and downloadable results.
- Clean up temporary files and protect user data.

## Design Rules

- Keep format conversion and compression behavior behind explicit service interfaces.
- Use shared request, job, result, and error models for web and Android.
- Document supported formats and limits as part of the API contract.
- Add tests before introducing platform-specific integrations.
