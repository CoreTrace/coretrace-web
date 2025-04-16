# CoreTrace Web

A web-based interface for the CoreTrace tool that uses WebAssembly for core functionality.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Bun](https://bun.sh/) (for package management)

## Getting Started

These instructions will help you set up the project locally for development and testing purposes.

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ctrace-web
```

2. Install dependencies:
```bash
bun install
```

### Running the Development Server

Start the development server with:
```bash
bun start
```

## Project Structure

- `public/` - Static assets
  - `wasm/` - WebAssembly files for the core CTrace functionality
- `src/` - Source code
  - `components/` - React components
  - `contexts/` - React contexts
  - `hooks/` - Custom React hooks
  - `services/` - Service modules
  - `styles/` - CSS and styling files

## WebAssembly Integration

This project uses WebAssembly modules located in `public/wasm/` to provide core tracing functionality.

## Technologies Used

- React
- WebAssembly
- Tailwind CSS
- Bun package manager