#include <iostream>
#include <vector>
#include <thread>
#include <cmath>

// Function to consume CPU
void consume_cpu()
{
    while (true)
    {
        for (int i = 0; i < 10000000; i++)
        {
            double result = std::sin(i) * std::cos(i);
            if (result > 100000000)
                break; // Never happens, prevents optimization
        }
    }
}

int main()
{
    std::cout << "Testing excessive resource usage..." << std::endl;

    // Memory test - try to allocate lots of memory
    std::cout << "Attempting to allocate 1GB of memory..." << std::endl;
    try
    {
        std::vector<char> memory_hog(1024 * 1024 * 1024, 'X'); // 1GB
        std::cout << "SUCCESS: Allocated 1GB of memory" << std::endl;
    }
    catch (const std::exception &e)
    {
        std::cout << "BLOCKED: Could not allocate memory: " << e.what() << std::endl;
    }

    // CPU test - spawn threads to max out CPU
    std::cout << "Attempting to spawn 4 CPU-intensive threads..." << std::endl;
    std::vector<std::thread> threads;
    for (int i = 0; i < 4; i++)
    {
        try
        {
            threads.push_back(std::thread(consume_cpu));
            std::cout << "Started CPU thread " << i << std::endl;
        }
        catch (const std::exception &e)
        {
            std::cout << "BLOCKED: Could not start thread: " << e.what() << std::endl;
        }
    }

    // Join threads (will never complete unless killed)
    for (auto &t : threads)
    {
        if (t.joinable())
            t.join();
    }

    return 0;
}