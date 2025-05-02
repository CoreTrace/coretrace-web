#include <iostream>
#include <chrono>
#include <thread>

int main()
{
    std::cout << "Starting long-running process..." << std::endl;

    // Run for 2 minutes (120 seconds)
    for (int i = 0; i < 120; i++)
    {
        std::cout << "Running for " << i << " seconds..." << std::endl;
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }

    std::cout << "Successfully ran for 2 minutes!" << std::endl;
    return 0;
}