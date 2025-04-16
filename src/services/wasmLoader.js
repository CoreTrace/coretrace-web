let wasmModule = null;
let wasmInstance = null;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export async function loadWasmModule() {
  try {
    if (wasmModule && wasmInstance) {
      return true;
    }

    try {
      // Use dynamic script loading rather than ES Module import
      // This works because the coretrace.js file is in the public folder
      // and will be available at runtime
      const script = document.createElement('script');
      script.src = process.env.PUBLIC_URL + '/wasm/ctrace.js';
      script.async = true;

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

      if (typeof window.module === 'undefined') {
        throw new Error('Module not defined after loading ctrace.js');
      }

      const module = await window.module();

      wasmModule = module;
      wasmInstance = { exports: module };

      console.log('CoreTrace WASM module loaded successfully');
      console.log('Available exports:', Object.keys(module));

      return true;
    } catch (error) {
      console.error('Failed to load using dynamic script loading:', error);
      return await loadWasmManually();
    }
  } catch (error) {
    console.error('Failed to load WASM module:', error);
    return false;
  }
}


async function loadWasmManually() {""
  try {
    // Fetch the WASM binary
    const response = await fetch('/wasm/coretrace.wasm');
    const wasmBytes = await response.arrayBuffer();

    // Compile the module
    wasmModule = await WebAssembly.compile(wasmBytes);

    // Get the import names that the module requires
    const imports = WebAssembly.Module.imports(wasmModule);
    console.log("Required imports:", imports);

    // Create memory instance for WASM
    const memory = new WebAssembly.Memory({ initial: 256, maximum: 1024 });

    // Create the importObject with environment functions
    const importObject = {
      env: {
        memory,
        // C++ exception handling functions
        __cxa_throw: function (ptr, type, destructor) {
          console.error("Exception thrown in WASM module");
          throw new Error("WASM exception");
        },
        __cxa_begin_catch: function () {
          console.log("__cxa_begin_catch called");
          return 0;
        },
        __cxa_end_catch: function () {
          console.log("__cxa_end_catch called");
        },
        __cxa_allocate_exception: function (size) {
          console.log("__cxa_allocate_exception called, size:", size);
          return 0; // Return a fake pointer
        },
        abort: function (what) {
          console.error("Abort called:", what);
          throw new Error("WASM aborted");
        },
        _emscripten_throw_longjmp: function () {
          console.warn("_emscripten_throw_longjmp called but not implemented");
        },
        _emscripten_resize_heap: function () {
          console.warn("_emscripten_resize_heap called but not implemented");
          return 0;
        },
        _tzset_js: function () {
          console.warn("_tzset_js called but not implemented");
          return 0;
        },
        _abort_js: function () {
          console.error("WASM abort called");
          throw new Error("WASM aborted");
        },
        // Add emscripten stack functions
        emscripten_stack_init: () => 0,
        emscripten_stack_get_free: () => 1024 * 1024, // 1MB stack
        emscripten_stack_get_base: () => 0,
        emscripten_stack_get_end: () => 0,
        emscripten_stack_get_current: () => 0,
        _emscripten_stack_restore: () => { },
        __emscripten_stack_alloc: () => 0
      },
      wasi_snapshot_preview1: {
        fd_write: () => 0,
        fd_close: () => 0,
        fd_seek: () => 0,
        fd_read: () => 0,
        proc_exit: () => { },
        environ_sizes_get: () => 0,
        environ_get: () => 0,
        args_sizes_get: () => 0,
        args_get: () => 0,
        random_get: () => 0,
        clock_time_get: () => 0,
      }
    };

    // Add any missing imports
    imports.forEach(imp => {
      if (!importObject[imp.module]) {
        importObject[imp.module] = {};
      }

      if (typeof importObject[imp.module][imp.name] !== 'function' &&
        imp.name !== 'memory') {
        console.warn(`Creating stub for missing import: ${imp.module}.${imp.name}`);
        importObject[imp.module][imp.name] = function () {
          console.warn(`Called stub function: ${imp.module}.${imp.name}`);
          return 0;
        };
      }
    });

    // Instantiate the WASM module
    const instance = await WebAssembly.instantiate(wasmModule, importObject);
    wasmInstance = instance;

    return true;
  } catch (error) {
    console.error('Failed to manually load WASM module:', error);
    return false;
  }
}

export function coreTraceAPI() {
  if (!wasmInstance) {
    return null;
  }

  return wasmInstance.exports;
}

export function stringToWasm(str) {
  const api = coreTraceAPI();
  if (!api) throw new Error('WASM module not loaded');

  const encoded = textEncoder.encode(str + '\0'); // Add null terminator for C strings
  const ptr = api.malloc(encoded.length);

  const memory = new Uint8Array(api.memory.buffer);
  memory.set(encoded, ptr);

  return { ptr, length: encoded.length - 1 }; // Don't include null terminator in length
}

export function readWasmString(ptr, length) {
  const api = coreTraceAPI();
  if (!api) throw new Error('WASM module not loaded');

  // If length is not provided, find the null terminator
  if (length === undefined) {
    const memory = new Uint8Array(api.memory.buffer);
    let end = ptr;
    while (memory[end] !== 0) end++;
    length = end - ptr;
  }

  const memory = new Uint8Array(api.memory.buffer);
  const bytes = memory.slice(ptr, ptr + length);
  return textDecoder.decode(bytes);
}

export function parseResults(resultsPtr, resultsLength) {
  const resultsJson = readWasmString(resultsPtr, resultsLength);
  return JSON.parse(resultsJson);
}