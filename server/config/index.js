const path = require('path');
const os = require('os');

module.exports = {
    // Server configuration
    server: {
        port: process.env.PORT || 5000,
        host: process.env.HOST || 'localhost',
        env: process.env.NODE_ENV || 'development'
    },

    // Sandbox configuration
    sandbox: {
        // QEMU configuration
        qemu: {
            memory: '64', // MB
            kernel: '/boot/vmlinuz-linux-lts',
            timeout: 30000, // ms
            preferredMethod: 'qemu', // qemu, bubblewrap, firejail, or fallback
            libRoot: '/usr/x86_64-linux-gnu',
            customLibDir: null
        },
        // Resource limits
        limits: {
            maxFileSize: 1024 * 1024, // 1MB
            maxFiles: 10,
            maxProcesses: 32,
            maxOpenFiles: 32,
            cpuTime: 5 // seconds
        }
    },

    // File system configuration
    filesystem: {
        tempDir: path.join(os.tmpdir(), 'coretrace'),
        workDir: path.join(process.cwd(), 'temp'),
        allowedExtensions: ['.c', '.cpp', '.h', '.hpp']
    },

    // Job management
    jobs: {
        cleanupDelay: 60000, // 1 minute
        retentionPeriod: 3600000 // 1 hour
    },

    // Logging configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'json'
    }
}; 