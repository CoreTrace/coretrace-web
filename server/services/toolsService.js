const { exec } = require('child_process');
const path = require('path');

/**
 * Get available tools by executing `ctrace --help`
 * @returns {Promise<Object>} JSON object with static, dynamic, and tools
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