#include <iostream>
#include <string>
#include <emscripten.h>

extern "C" {

EMSCRIPTEN_KEEPALIVE
int contains_main(const char* code)
{
    std::string str(code);

    if (str.find("main(") != std::string::npos) {
        std::cout << "✅ Found 'main' function.\n";
        return 0;
    } else {
        std::cerr << "❌ No 'main' function found.\n";
        return 1;
    }
}

}
