import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
