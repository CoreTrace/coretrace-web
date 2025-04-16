#include <emscripten.h>
#include <string>
#include <regex>

extern "C" {
    EMSCRIPTEN_KEEPALIVE
    const char* analyze_code(const char* code) {
        std::string codeStr(code);
        std::regex mainRegex("\\s*int\\s+main\\s*\\([^)]*\\)");

        static std::string result;
        if (std::regex_search(codeStr, mainRegex)) {
            result = "{ \"success\": true, \"message\": \"Main function found\", \"details\": { \"hasMain\": true } }";
        } else {
            result = "{ \"success\": true, \"message\": \"No main function found\", \"details\": { \"hasMain\": false } }";
        }

        return result.c_str();
    }
}