#include <iostream>
#include <fstream>
#include <string>

int main()
{
    std::cout << "Attempting to read sensitive files outside sandbox..." << std::endl;

    // Try to read /etc/passwd
    std::ifstream passwd_file("/etc/passwd");
    if (passwd_file.is_open())
    {
        std::string line;
        std::cout << "SUCCESS: Could read /etc/passwd:" << std::endl;
        int count = 0;
        while (std::getline(passwd_file, line) && count < 3)
        {
            std::cout << line << std::endl;
            count++;
        }
        passwd_file.close();
    }
    else
    {
        std::cout << "BLOCKED: Could not read /etc/passwd" << std::endl;
    }

    // Try to read home directory files
    std::string home_path = std::string(getenv("HOME")) + "/.bashrc";
    std::ifstream home_file(home_path);
    if (home_file.is_open())
    {
        std::string line;
        std::cout << "SUCCESS: Could read " << home_path << ":" << std::endl;
        int count = 0;
        while (std::getline(home_file, line) && count < 3)
        {
            std::cout << line << std::endl;
            count++;
        }
        home_file.close();
    }
    else
    {
        std::cout << "BLOCKED: Could not read " << home_path << std::endl;
    }

    return 0;
}