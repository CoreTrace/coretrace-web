# CoreTrace API Documentation

## Overview

The CoreTrace API provides endpoints for analyzing C/C++ code using various static and dynamic analysis tools. The API supports file upload, analysis configuration, and result retrieval.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Content-Type

All requests should use `application/json` content type.

## Endpoints

### 1. Analyze Code

**Endpoint:** `POST /api/analyze`

**Description:** Analyzes uploaded C/C++ code files using configured analysis tools.

**Request Body:**
```json
{
  "files": {
    "filename.c": "#include <stdio.h>\nint main() { return 0; }"
  },
  "options": {
    "static": true,
    "dynamic": false,
    "tools": ["flawfinder", "cppcheck"]
  }
}
```

**Parameters:**
- `files` (Object): Key-value pairs where keys are filenames and values are file contents
- `options` (Object, optional): Analysis configuration
  - `static` (boolean, optional): Enable static analysis (default: true)
  - `dynamic` (boolean, optional): Enable dynamic analysis (default: false)
  - `tools` (Array<string>, optional): List of tools to use for analysis

**Response:**
```json
{
  "tool": "flawfinder",
  "results": [
    {
      "message": "Buffer overflow vulnerability detected",
      "locations": [
        {
          "file": "main.c",
          "startLine": 10,
          "startColumn": 5,
          "endColumn": 15,
          "snippet": "strcpy(buffer, input);"
        }
      ]
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "No files provided"
}
```

**Status Codes:**
- `200 OK`: Analysis completed successfully
- `400 Bad Request`: Invalid request (missing files, invalid options)
- `500 Internal Server Error`: Analysis failed

### 2. Get Available Tools

**Endpoint:** `GET /api/tools`

**Description:** Retrieves a list of available analysis tools.

**Request:** No parameters required

**Response:**
```json
{
  "tools": ["flawfinder", "cppcheck", "clang-tidy"]
}
```

**Error Response:**
```json
{
  "error": "Failed to retrieve tools"
}
```

**Status Codes:**
- `200 OK`: Tools retrieved successfully
- `500 Internal Server Error`: Failed to retrieve tools

### 3. Get Examples

**Endpoint:** `GET /api/examples`

**Description:** Retrieves a list of available example code snippets.

**Request:** No parameters required

**Response:**
```json
[
  {
    "id": "buffer-overflow",
    "name": "Buffer Overflow Example",
    "description": "Demonstrates common buffer overflow vulnerabilities"
  }
]
```

**Status Codes:**
- `200 OK`: Examples retrieved successfully
- `500 Internal Server Error`: Failed to retrieve examples

### 4. Get Specific Example

**Endpoint:** `GET /api/examples/:id`

**Description:** Retrieves a specific example code snippet by ID.

**Parameters:**
- `id` (string): The unique identifier of the example

**Response:**
```json
{
  "id": "buffer-overflow",
  "name": "Buffer Overflow Example",
  "description": "Demonstrates common buffer overflow vulnerabilities",
  "code": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n  char buffer[10];\n  strcpy(buffer, \"This string is too long\");\n  return 0;\n}"
}
```

**Error Response:**
```json
{
  "error": "Example not found"
}
```

**Status Codes:**
- `200 OK`: Example retrieved successfully
- `404 Not Found`: Example not found
- `500 Internal Server Error`: Failed to retrieve example

## Data Types

### Analysis Result

```typescript
interface AnalysisResult {
  tool: string;
  results: Finding[];
}

interface Finding {
  message: string;
  locations: Location[];
}

interface Location {
  file: string;
  startLine?: number;
  startColumn?: number;
  endColumn?: number;
  snippet?: string;
}
```

### Analysis Options

```typescript
interface AnalysisOptions {
  static?: boolean;
  dynamic?: boolean;
  tools?: string[];
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common error scenarios:
- Missing required parameters
- Invalid file formats
- File size limits exceeded
- Analysis tool failures
- Server configuration issues

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production deployments.

## File Size Limits

- Maximum file size: 1MB per file
- Maximum number of files: 10 files per request
- Supported file extensions: `.c`, `.cpp`, `.h`, `.hpp`

## Sandboxing

All code analysis is performed in sandboxed environments using:
- Firejail for process isolation
- QEMU for virtualization (when available)
- Resource limits (CPU, memory, file descriptors)

## Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

// Analyze code
const analyzeCode = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/analyze', {
      files: {
        'main.c': '#include <stdio.h>\nint main() { return 0; }'
      },
      options: {
        static: true,
        tools: ['flawfinder']
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error('Analysis failed:', error.response?.data?.error);
  }
};

// Get available tools
const getTools = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/tools');
    console.log(response.data.tools);
  } catch (error) {
    console.error('Failed to get tools:', error.response?.data?.error);
  }
};
```

### Python

```python
import requests

# Analyze code
def analyze_code():
    url = 'http://localhost:5000/api/analyze'
    data = {
        'files': {
            'main.c': '#include <stdio.h>\nint main() { return 0; }'
        },
        'options': {
            'static': True,
            'tools': ['flawfinder']
        }
    }
    
    response = requests.post(url, json=data)
    if response.status_code == 200:
        print(response.json())
    else:
        print(f"Error: {response.json().get('error')}")

# Get available tools
def get_tools():
    url = 'http://localhost:5000/api/tools'
    response = requests.get(url)
    if response.status_code == 200:
        print(response.json()['tools'])
    else:
        print(f"Error: {response.json().get('error')}")
```

### cURL

```bash
# Analyze code
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "files": {
      "main.c": "#include <stdio.h>\nint main() { return 0; }"
    },
    "options": {
      "static": true,
      "tools": ["flawfinder"]
    }
  }'

# Get available tools
curl http://localhost:5000/api/tools
```

## Versioning

Current API version: v1

API versioning is not yet implemented. Future versions may include versioning in the URL path (e.g., `/api/v1/analyze`).

## Changelog

### v1.0.0
- Initial API implementation
- Code analysis endpoint
- Tools information endpoint
- Examples endpoints
- Basic error handling
- Sandboxed execution