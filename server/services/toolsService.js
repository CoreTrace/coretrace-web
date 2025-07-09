/**
 * @module ToolsService
 * @description Service for retrieving information about available analysis tools from ctrace.
 * Provides functionality to query and parse available tools for code analysis.
 */

const { exec } = require('child_process');
const path = require('path');

/**
 * @function getAvailableTools
 * @description Retrieves available analysis tools by executing `ctrace --help` and parsing the output.
 * Extracts tool information from the help output and returns a structured list of available tools.
 * @returns {Promise<Array<string>>} Array of available tool names
 * @throws {Error} When ctrace execution fails or tool parsing fails
 * 
 * @example
 * const tools = await getAvailableTools();
 * // Returns: ['flawfinder', 'cppcheck', 'clang-tidy']
 */
async function getAvailableTools() {
  const ctracePath = path.join(__dirname, '../../server/bin/ctrace');

  return new Promise((resolve, reject) => {
    exec(`${ctracePath} --help`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing ctrace:', stderr);
        return reject(error);
      }

      // Parse the output to extract tools
      const toolsMatch = stdout.match(/Available tools: (.+)/);
      if (toolsMatch && toolsMatch[1]) {
        const tools = toolsMatch[1].split(',').map(tool => tool.trim());
        return resolve(tools);
      }

      reject(new Error('Failed to parse available tools from ctrace output'));
    });
  });
}

module.exports = { getAvailableTools };