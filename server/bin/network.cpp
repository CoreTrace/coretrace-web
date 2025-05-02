#include <iostream>
#include <cstring>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>

int main()
{
    std::cout << "Attempting to access network..." << std::endl;

    // Create socket
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0)
    {
        std::cout << "BLOCKED: Could not create socket" << std::endl;
        return 0;
    }

    // Set up connection to Google DNS
    struct sockaddr_in server;
    server.sin_addr.s_addr = inet_addr("8.8.8.8");
    server.sin_family = AF_INET;
    server.sin_port = htons(53);

    // Try to connect
    if (connect(sock, (struct sockaddr *)&server, sizeof(server)) < 0)
    {
        std::cout << "BLOCKED: Could not connect to 8.8.8.8" << std::endl;
    }
    else
    {
        std::cout << "SUCCESS: Connected to 8.8.8.8" << std::endl;
    }

    close(sock);
    return 0;
}