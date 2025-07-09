/**
 * @module AnalysisContext
 * @description React context for managing code analysis state and operations.
 * Provides centralized state management for code editor, analysis options, and results.
 */

import React, { createContext, useState, useContext } from 'react';
import { analyzeCode as analyzeCodeAPI } from '../services/api/api';
import PropTypes from 'prop-types';

/**
 * @type {React.Context}
 * @description React context for analysis-related state and functions
 */
const AnalysisContext = createContext();

/**
 * @function useAnalysis
 * @description Custom hook to access the analysis context
 * @returns {Object} Analysis context value containing state and functions
 * @throws {Error} When used outside of AnalysisProvider
 * 
 * @example
 * const { code, setCode, analyzeCode } = useAnalysis();
 */
export const useAnalysis = () => useContext(AnalysisContext);

/**
 * @component AnalysisProvider
 * @description Provider component that manages analysis state and provides context to children
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with context
 * @returns {JSX.Element} Provider component with analysis context
 * 
 * @example
 * <AnalysisProvider>
 *   <App />
 * </AnalysisProvider>
 */
export const AnalysisProvider = ({ children }) => {
    /**
     * @type {string}
     * @description The code content in the editor
     */
    const [code, setCode] = useState('// Write your C/C++ code here\n#include <stdio.h>\n\nint main() {\n  printf("Hello, CoreTrace!\\n");\n  return 0;\n}');

    /**
     * @type {string}
     * @description The filename for the code being analyzed
     */
    const [filename, setFilename] = useState('main.c');

    /**
     * @type {boolean}
     * @description Loading state for analysis operations
     */
    const [loading, setLoading] = useState(false);

    /**
     * @type {Object|null}
     * @description Analysis results or null if no analysis has been performed
     */
    const [results, setResults] = useState(null);

    /**
     * @type {Object}
     * @description Analysis options and configuration
     * @property {boolean} static - Enable static analysis
     * @property {boolean} dynamic - Enable dynamic analysis
     * @property {Array<string>} tools - Selected tools for analysis
     */
    const [options, setOptions] = useState({
        static: true,
        dynamic: false,
        tools: ['cppcheck', 'flawfinder']
    });

    /**
     * @function handleOptionChange
     * @description Toggles boolean analysis options (static/dynamic)
     * @param {string} option - The option to toggle ('static' or 'dynamic')
     */
    const handleOptionChange = (option) => {
        if (option === 'static' || option === 'dynamic') {
            setOptions({ ...options, [option]: !options[option] });
        }
    };

    /**
     * @function handleToolToggle
     * @description Toggles the inclusion of a specific tool in analysis options
     * @param {string} tool - The name of the tool to toggle
     */
    const handleToolToggle = (tool) => {
        const updatedTools = options.tools.includes(tool)
            ? options.tools.filter(t => t !== tool)
            : [...options.tools, tool];

        setOptions({ ...options, tools: updatedTools });
    };

    /**
     * @function analyzeCode
     * @description Performs code analysis using the current code, filename, and options
     * Updates loading state and results accordingly
     * @async
     */
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

AnalysisProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
