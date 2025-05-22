import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000 // 10 seconds timeout
});

/**
 * Analyzes the provided code using the specified options.
 *
 * @async
 * @function analyzeCode
 * @param {string} filename - The name of the file containing the code to analyze.
 * @param {string} code - The code to be analyzed.
 * @param {Object} options - The options to customize the analysis process.
 * @returns {Promise<Object>} The analysis result returned from the API.
 * @throws {Error} Throws an error if the analysis fails, with the error message from the API or a default message.
 */
export const analyzeCode = async (filename, code, options) => {
    try {
        console.log('Analyzing code with options:', options);
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
 * Fetches the list of available tools from the server.
 *
 * @async
 * @function getAvailableTools
 * @returns {Promise<Object[]>} A promise that resolves to an array of tools.
 * @throws {Error} Throws an error if the request fails, with a message from the server or a default message.
 */
export const getAvailableTools = async () => {
    try {
        const response = await api.get('/api/tools');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to retrieve tools');
    }
};
