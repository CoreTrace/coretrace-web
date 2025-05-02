import React, { createContext, useState, useContext } from 'react';
import { analyzeCode as analyzeCodeAPI } from '../services/api/api';

const AnalysisContext = createContext();

export const useAnalysis = () => useContext(AnalysisContext);

export const AnalysisProvider = ({ children }) => {
    const [code, setCode] = useState('// Write your C/C++ code here\n#include <stdio.h>\n\nint main() {\n  printf("Hello, CoreTrace!\\n");\n  return 0;\n}');
    const [filename, setFilename] = useState('main.c');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [options, setOptions] = useState({
        static: true,
        dynamic: false,
        tools: ['cppcheck', 'flawfinder']
    });

    const handleOptionChange = (option) => {
        if (option === 'static' || option === 'dynamic') {
            setOptions({ ...options, [option]: !options[option] });
        }
    };

    const handleToolToggle = (tool) => {
        const updatedTools = options.tools.includes(tool)
            ? options.tools.filter(t => t !== tool)
            : [...options.tools, tool];

        setOptions({ ...options, tools: updatedTools });
    };

    const analyzeCode = async () => {
        try {
            setLoading(true);
            setResults(null);

            const result = await analyzeCodeAPI(filename, code, options);
            setResults(result);
        } catch (error) {
            console.error('Error analyzing code:', error);
            setResults({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnalysisContext.Provider value={{
            code, setCode,
            filename, setFilename,
            loading,
            results,
            options,
            handleOptionChange,
            handleToolToggle,
            analyzeCode
        }}>
            {children}
        </AnalysisContext.Provider>
    );
};