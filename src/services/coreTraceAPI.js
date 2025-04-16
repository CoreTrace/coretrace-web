import { loadWasmModule, coreTraceAPI, stringToWasm } from './wasmLoader';

export async function initializeCoreTool() {
  try {
    const loaded = await loadWasmModule();
    return loaded;
  } catch (error) {
    console.error('Failed to load CoreTrace WASM module:', error);
    return false;
  }
}

export async function runStaticAnalysis(code) {
  try {
    // await loadWasmModule();
    const api = coreTraceAPI();
    if (!api) {
      throw new Error('CoreTrace WASM module not loaded');
    }

    // Convert the code string to a pointer in WASM memory
    const { ptr } = stringToWasm(code);

    // Call the actual function that exists in the WASM module
    const resultPtr = api.analyze_code(ptr);

    // Read the result string from WASM memory
    const resultString = readStringFromWasm(resultPtr);

    // Parse the JSON result
    const result = JSON.parse(resultString);

    // Free memory allocated for the code
    api.free(ptr);

    // Transform to our app's format
    // If main function was found, it's an info, otherwise a warning
    return [{
      type: result.details.hasMain ? 'info' : 'warning',
      message: result.message,
      line: 1,
      column: 1
    }];
  } catch (error) {
    console.error('Static analysis error:', error);
    return [{
      type: 'error',
      message: `Analysis error: ${error instanceof Error ? error.message : String(error)}`,
      line: 1,
      column: 1
    }];
  }
}

export async function runDynamicAnalysis(code) {
  // For now, since your WASM module doesn't support dynamic analysis,
  // just return a placeholder result
  return [{
    type: 'info',
    message: 'Dynamic analysis not yet implemented',
    line: 1,
    column: 1
  }];
}

// Helper function to read a string from WASM memory
function readStringFromWasm(ptr) {
  const api = coreTraceAPI();
  if (!api) throw new Error('WASM module not loaded');

  // Find the null terminator
  const memory = new Uint8Array(api.memory.buffer);
  let end = ptr;
  while (memory[end] !== 0) end++;

  // Create a string from the memory
  const textDecoder = new TextDecoder();
  return textDecoder.decode(memory.slice(ptr, end));
}

// Helper function to jump to a specific location in code
export function jumpToLocation(editor, line, column) {
  if (!editor) return;

  editor.revealPositionInCenter({
    lineNumber: line,
    column: column
  });

  editor.setPosition({
    lineNumber: line,
    column: column
  });

  editor.focus();
}