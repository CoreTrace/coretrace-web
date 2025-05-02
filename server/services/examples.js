const exampleSnippets = {
    'hello-world': {
        id: 'hello-world',
        title: 'Hello World',
        description: 'A simple Hello World program in C',
        language: 'c',
        files: {
            'main.c': `#include <stdio.h>
  
  int main() {
      printf("Hello, World!\\n");
      return 0;
  }`
        }
    },
    'buffer-overflow': {
        id: 'buffer-overflow',
        title: 'Buffer Overflow Example',
        description: 'An example demonstrating a potential buffer overflow vulnerability',
        language: 'c',
        files: {
            'vulnerable.c': `#include <stdio.h>
  #include <string.h>
  
  void insecure_function(char *input) {
      char buffer[10];
      strcpy(buffer, input); // No bounds checking
      printf("Buffer content: %s\\n", buffer);
  }
  
  int main(int argc, char *argv[]) {
      if (argc > 1) {
          insecure_function(argv[1]);
      } else {
          printf("Please provide an argument\\n");
      }
      return 0;
  }`
        }
    },
    'memory-leak': {
        id: 'memory-leak',
        title: 'Memory Leak Example',
        description: 'An example demonstrating a memory leak',
        language: 'cpp',
        files: {
            'leak.cpp': `#include <iostream>
  
  void leak_memory() {
      int* arr = new int[100];
      // Missing delete[] arr;
  }
  
  int main() {
      for (int i = 0; i < 1000; i++) {
          leak_memory();
      }
      std::cout << "Program finished\\n";
      return 0;
  }`
        }
    }
};

/**
 * Get a list of all available example code snippets
 * @returns {Array} List of example metadata (without code content)
 */
function getExampleList() {
    return Object.values(exampleSnippets).map(({ id, title, description, language }) => ({
        id,
        title,
        description,
        language
    }));
}

/**
 * Get a specific example by ID
 * @param {string} id - Example ID
 * @returns {Object|null} Example object or null if not found
 */
function getExampleCode(id) {
    return exampleSnippets[id] || null;
}

module.exports = {
    getExampleList,
    getExampleCode
};