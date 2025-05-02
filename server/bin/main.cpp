#include <iostream>

int main()
{
    // Define a null pointer
    int *ptr = nullptr;

    std::cout << "About to cause a segmentation fault..." << std::endl;

    // Dereferencing a null pointer will cause a segfault
    *ptr = 42;

    // This line will never be executed
    std::cout << "This line will never be printed." << std::endl;

    return 0;
}