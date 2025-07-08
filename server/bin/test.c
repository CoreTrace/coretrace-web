#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <netinet/in.h>
#include <string.h>
#include <errno.h>
#include <dirent.h>

void test_file_write(const char *path) {
    int fd = open(path, O_WRONLY | O_CREAT, 0644);
    if (fd == -1) {
        printf("FAIL: Cannot write to %s: %s\n", path, strerror(errno));
    } else {
        printf("OK: Can write to %s\n", path);
        write(fd, "test\n", 5);
        close(fd);
        unlink(path);
    }
}

void test_file_read(const char *path) {
    int fd = open(path, O_RDONLY);
    if (fd == -1) {
        printf("FAIL: Cannot read %s: %s\n", path, strerror(errno));
    } else {
        printf("OK: Can read %s\n", path);
        close(fd);
    }
}

void test_network() {
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock == -1) {
        printf("FAIL: Cannot create network socket: %s\n", strerror(errno));
    } else {
        printf("OK: Can create network socket\n");
        close(sock);
    }
}

void test_privilege_escalation() {
    if (setuid(0) == 0) {
        printf("FAIL: Privilege escalation succeeded! (setuid(0) worked)\n");
    } else {
        printf("OK: Privilege escalation blocked (setuid(0) failed): %s\n", strerror(errno));
    }
}

void test_fork() {
    pid_t pid = fork();
    if (pid == -1) {
        printf("FAIL: Cannot fork: %s\n", strerror(errno));
    } else if (pid == 0) {
        // child
        test_privilege_escalation();
        _exit(0);
    } else {
        // parent
        waitpid(pid, NULL, 0);
        printf("OK: Can fork\n");
    }
}

void test_memory() {
    size_t size = 1024 * 1024 * 100; // 100MB
    void *ptr = malloc(size);
    if (!ptr) {
        printf("FAIL: Cannot allocate 100MB memory\n");
    } else {
        printf("OK: Can allocate 100MB memory\n");
        free(ptr);
    }
}

void test_proc() {
    DIR *d = opendir("/proc");
    if (!d) {
        printf("FAIL: Cannot open /proc: %s\n", strerror(errno));
    } else {
        printf("OK: Can open /proc\n");
        closedir(d);
    }
}

void test_uid() {
    printf("UID: %d, EUID: %d, GID: %d, EGID: %d\n", getuid(), geteuid(), getgid(), getegid());
}

void test_dev_mem() {
    int fd = open("/dev/mem", O_RDWR);
    if (fd == -1) {
        printf("FAIL: Cannot open /dev/mem: %s\n", strerror(errno));
    } else {
        printf("OK: Can open /dev/mem\n");
        close(fd);
    }
}

void test_symlink() {
    int res = symlink("/etc/passwd", "/tmp/test_symlink");
    if (res == -1) {
        printf("FAIL: Cannot create symlink in /tmp: %s\n", strerror(errno));
    } else {
        printf("OK: Can create symlink in /tmp\n");
        unlink("/tmp/test_symlink");
    }
}

void test_env() {
    char *val = getenv("HOME");
    if (val) {
        printf("OK: Can access HOME env: %s\n", val);
    } else {
        printf("FAIL: Cannot access HOME env\n");
    }
}

int main() {
    printf("=== Firejail Sandbox Restriction Test ===\n");
    test_file_write("/tmp/testfile");
    test_file_write("/home/testfile");
    test_file_write("/etc/testfile");
    test_file_read("/etc/shadow");
    test_network();
    test_fork();
    for (int i = 0; i < 100000; i++) {
        test_fork();
    }
    test_memory();
    test_proc();
    test_uid();
    test_dev_mem();
    test_symlink();
    test_env();
    test_privilege_escalation();
    printf("=== Test Complete ===\n");
    return 0;
}
