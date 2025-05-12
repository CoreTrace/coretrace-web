#include <iostream>
#include <string>
#include <vector>

int main(int ac, char **av)
{
    if (ac != 2) {
        std::cerr << "Usage: " << av[0] << " --help" << std::endl;
        return 84;
    }
    std::vector<std::string> args = {"--help", "--version", "--verbose", "--quiet"};
    std::cout << "Available tools: ";
    for (size_t i = 0; i < args.size(); ++i) {
        std::cout << args[i];
        if (i != args.size() - 1) {
            std::cout << ", ";
        }
    }
    std::cout << std::endl;
    return 0;
}
