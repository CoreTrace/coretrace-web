# CoreTrace Web Application

A full-stack web application for analyzing C/C++ code using various static and dynamic analysis tools. The application provides a modern web interface for uploading code, configuring analysis options, and viewing security findings.

## Features

- **Code Analysis**: Analyze C/C++ code using multiple tools (flawfinder, cppcheck, etc.)
- **Sandboxed Execution**: Secure code analysis in isolated environments
- **Modern UI**: React-based interface with Monaco Editor for code editing
- **Real-time Results**: View analysis results with syntax highlighting
- **Tool Selection**: Choose which analysis tools to use
- **Example Code**: Pre-built examples for testing and learning

## Architecture

### Backend (Node.js/Express)
- **Server**: Express.js REST API
- **Analysis Engine**: Custom analyzer with tool integration
- **Sandboxing**: Multiple isolation methods (Firejail, QEMU, Bubblewrap)
- **Job Management**: Asynchronous analysis job handling
- **Logging**: Structured logging with Winston

### Frontend (React)
- **UI Framework**: React with Tailwind CSS
- **Code Editor**: Monaco Editor with syntax highlighting
- **State Management**: React Context for application state
- **API Integration**: Axios for backend communication

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Linux environment (for sandboxing tools)
- Firejail (recommended) or QEMU

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd coretrace-web
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Documentation

### API Documentation

Comprehensive API documentation is available in [`server/API_DOCUMENTATION.md`](server/API_DOCUMENTATION.md).

**Key Endpoints:**
- `POST /api/analyze` - Analyze code files
- `GET /api/tools` - Get available analysis tools
- `GET /api/examples` - Get example code snippets

### Code Documentation

#### Backend Documentation

The backend code is documented using JSDoc. Generate documentation by running:

```bash
cd server
npm run docs
```

Then open `server/docs/index.html` in your browser.

**Documented Modules:**
- **Services**: Analyzer, JobManager, Logger, Sandbox, SARIF Parser
- **Routes**: Analysis, Examples, Tools endpoints
- **Controllers**: Request handling and validation
- **Configuration**: Environment and sandbox settings

#### Frontend Documentation

Frontend components are documented with JSDoc comments:

**Key Components:**
- `App.jsx` - Main application component
- `AnalysisContext.jsx` - State management context
- `ApiService` - Backend communication
- Editor components for code editing and results display

### Architecture Documentation

#### Backend Architecture

```
server/
├── services/          # Business logic
│   ├── analyzer.js    # Main analysis orchestrator
│   ├── jobManager.js  # Job lifecycle management
│   ├── sandbox.js     # Execution isolation
│   ├── logger.js      # Logging service
│   └── sarifParser.js # Result parsing
├── routes/            # API endpoints
├── controllers/       # Request handlers
├── middlewares/       # Express middleware
└── config/           # Configuration
```

#### Frontend Architecture

```
client/src/
├── components/        # React components
│   └── Editor/       # Code editor components
├── context/          # React context
├── services/         # API services
└── App.jsx          # Main component
```

## Configuration

### Backend Configuration

Edit `server/config/index.js` to customize:

- **Sandbox Settings**: Memory limits, timeouts, isolation methods
- **File Limits**: Maximum file sizes and counts
- **Job Management**: Cleanup delays and retention periods
- **Logging**: Log levels and formats

### Environment Variables

**Backend:**
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode
- `QEMU_BINARY` - QEMU binary path
- `QEMU_LIB_ROOT` - QEMU library root

**Frontend:**
- `REACT_APP_API_URL` - Backend API URL

## Development

### Backend Development

```bash
cd server
npm run dev          # Start with nodemon
npm run docs         # Generate documentation
npm test             # Run tests
```

### Frontend Development

```bash
cd client
npm start            # Start development server
npm test             # Run tests
npm run build        # Build for production
```

### Adding New Analysis Tools

1. **Backend Integration**
   - Add tool binary to `server/bin/`
   - Update `services/analyzer.js` to include new tool
   - Add tool configuration to `config/index.js`

2. **Frontend Integration**
   - Update tool selection UI in `components/Editor/`
   - Add tool-specific result display logic

### Documentation Standards

#### JSDoc Comments

Use standard JSDoc format for all functions and classes:

```javascript
/**
 * @function functionName
 * @description Brief description of what the function does
 * @param {string} paramName - Description of parameter
 * @returns {Promise<Object>} Description of return value
 * @throws {Error} Description of when error is thrown
 */
```

#### API Documentation

- Update `server/API_DOCUMENTATION.md` for new endpoints
- Include request/response examples
- Document error scenarios

## Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Production Considerations

- **Security**: Implement authentication and rate limiting
- **Monitoring**: Add application monitoring and logging
- **Scaling**: Consider job queue systems for high load
- **Backup**: Implement data backup strategies

## Troubleshooting

### Common Issues

1. **Sandbox Failures**
   - Ensure Firejail is installed: `sudo apt install firejail`
   - Check file permissions in sandbox directories
   - Verify resource limits in configuration

2. **Analysis Tool Errors**
   - Verify tool binaries are executable
   - Check tool dependencies are installed
   - Review tool-specific error logs

3. **API Connection Issues**
   - Verify backend server is running
   - Check CORS configuration
   - Ensure correct API URL in frontend

### Logs

- **Backend**: Check `server/combined.log` and `server/error.log`
- **Frontend**: Browser developer console
- **Sandbox**: Check system logs for sandbox-related errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit a pull request

## License

[Add your license information here]

## Support

For issues and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting section