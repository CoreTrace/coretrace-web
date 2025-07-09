/**
 * @module ApiService
 * @description API service for communicating with the CoreTrace backend server.
 * Provides functions for code analysis and tool information retrieval.
 */

import axios from 'axios';

/**
 * @type {string}
 * @description Base URL for the API server, configurable via environment variable
 */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * @type {Object}
 * @description Axios instance configured for API communication
 * @property {string} baseURL - Base URL for all API requests
 * @property {Object} headers - Default headers for API requests
 * @property {number} timeout - Request timeout in milliseconds
 */
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000 // 10 seconds timeout
});

/**
 * @function analyzeCode
 * @description Analyzes the provided code using the specified options.
 * Sends code and analysis options to the backend server for processing.
 * 
 * @async
 * @param {string} filename - The name of the file containing the code to analyze
 * @param {string} code - The source code to be analyzed
 * @param {Object} options - The options to customize the analysis process
 * @param {boolean} [options.static] - Enable static analysis
 * @param {boolean} [options.dynamic] - Enable dynamic analysis
 * @param {Array<string>} [options.tools] - Array of tools to use for analysis
 * @returns {Promise<Object>} The analysis result with tool-specific findings
 * @throws {Error} When the analysis fails, with error message from API or default message
 * 
 * @example
 * const result = await analyzeCode('main.c', '#include <stdio.h>\nint main() { return 0; }', {
 *   static: true,
 *   dynamic: false,
 *   tools: ['flawfinder']
 * });
 */
export const analyzeCode = async (filename, code, options) => {
    try {
        const response = await axios.post(`${API_URL}/api/analyze`, {
            files: { [filename]: code },
            options
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to analyze code');
    }
};

/**
 * @function getAvailableTools
 * @description Fetches the list of available analysis tools from the server.
 * Retrieves information about tools that can be used for code analysis.
 * 
 * @async
 * @returns {Promise<Object>} Promise that resolves to an object containing available tools
 * @returns {Object} tools - Object containing tool information
 * @returns {Array<string>} tools.tools - Array of available tool names
 * @throws {Error} When the request fails, with error message from server or default message
 * 
 * @example
 * const tools = await getAvailableTools();
 * // Returns: { tools: ['flawfinder', 'cppcheck', 'clang-tidy'] }
 */
export const getAvailableTools = async () => {
    try {
        const response = await api.get('/api/tools');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to retrieve tools');
    }
};
