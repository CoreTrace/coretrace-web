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