# CoreTrace Web Interface

A web-based interface for the CoreTrace tool that uses WebAssembly for core functionality.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)

## Getting Started

These instructions will help you set up the project locally for development and testing purposes.

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ctrace-web
```

2. Install dependencies for the client:
```bash
cd client
npm install
```

3. Install dependencies for the server:
```bash
cd server
npm install
```

### Running the Development Server

Start the development server with:
```bash
cd server
npm run dev
```

### Running the Client
In a separate terminal, start the client:
```bash
cd client
npm run start
```

## Project Structure

- `client/` - Contains the React frontend application.
- `server/` - Contains the Node.js backend server.

## Technologies Used

- React
- WebAssembly
- Tailwind CSS

# CoreTrace Web - Analysis Pipeline

## Overview
This project provides a secure web-based code analysis pipeline for C/C++ code, using sandboxing for safe execution. The main server-side components are:

- **routes/analyze.js**: Express route for submitting code for analysis and querying job status.
- **services/analyzer.js**: Orchestrates the analysis process, manages jobs, and interacts with the sandbox.
- **services/sandbox.js**: Provides sandboxing utilities, including QEMU user-mode, Bubblewrap, and Firejail.

---

## How the Analysis Pipeline Works

### 1. `routes/analyze.js`
- Exposes the `/api/analyze` POST endpoint.
- Receives code files and options from the client.
- Validates input and creates an analysis job via `jobManager`.
- Calls `analyzer.analyzeCode()` to start the analysis.
- Provides a `/api/analyze/:jobId` GET endpoint to check job status/results.

### 2. `services/analyzer.js`
- Handles the main analysis logic.
- Validates files and creates a job.
- Saves files to a sandboxed working directory.
- Determines the correct analysis executable (e.g., `ctrace`).
- Builds command-line arguments based on options.
- Calls `sandboxWithBestMethod()` from `sandbox.js` to run the analysis in a secure environment.
- Cleans up output and updates job status.

### 3. `services/sandbox.js`
- Provides multiple sandboxing methods:
  - **QEMU user-mode** (default): Runs binaries in a CPU-emulated environment for strong isolation.
  - **Bubblewrap**: Uses Linux namespaces and seccomp for lightweight sandboxing.
  - **Firejail**: Uses seccomp and resource limits for sandboxing.
- The best available method is chosen based on configuration and system capabilities.
- QEMU user-mode is highly configurable via environment variables.

---

## QEMU Configuration via `.env`

You can configure the QEMU binary and library root used for sandboxing by editing the `.env` file in the project root:

```
QEMU_BINARY=qemu-x86_64
QEMU_LIB_ROOT=/usr/x86_64-linux-gnu
```

- `QEMU_BINARY`: Path or name of the QEMU user-mode binary to use (e.g., `qemu-x86_64`).
- `QEMU_LIB_ROOT`: Root directory for system libraries (should match your system's architecture and library location).

These values are loaded at runtime and used by `sandbox.js` when running C/C++ binaries in the sandbox.

---

## Troubleshooting
- If you see errors about missing `.so` files, ensure all required libraries are present in `QEMU_LIB_ROOT`.
- If you see sanitizer errors (e.g., LeakSanitizer), rebuild your binary without sanitizers for use in the sandbox.
- For more details, see comments in each file or contact the maintainers.