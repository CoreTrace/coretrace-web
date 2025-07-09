/**
 * @module Config
 * @description Application configuration module that centralizes all configuration settings.
 * Provides environment-based configuration for server, sandbox, filesystem, jobs, and logging.
 */

const path = require('path');
const os = require('os');

/**
 * @type {Object}
 * @description Main configuration object containing all application settings.
 * Supports environment variable overrides for flexible deployment configurations.
 */
module.exports = {
    /**
     * @property {Object} server - Server configuration settings
     * @property {number} server.port - HTTP server port, defaults to 5000
     * @property {string} server.host - Server hostname, defaults to 'localhost'
     * @property {string} server.env - Environment mode, defaults to 'development'
     */
    server: {
        port: process.env.PORT || 5000,
        host: process.env.HOST || 'localhost',
        env: process.env.NODE_ENV || 'development'
    },

    /**
     * @property {Object} sandbox - Sandbox execution configuration
     * @property {Object} sandbox.qemu - QEMU virtualization settings
     * @property {string} sandbox.qemu.memory - Memory limit in MB
     * @property {string} sandbox.qemu.kernel - Kernel path for QEMU
     * @property {number} sandbox.qemu.timeout - Execution timeout in milliseconds
     * @property {string} sandbox.qemu.preferredMethod - Preferred sandbox method
     * @property {string} sandbox.qemu.libRoot - Library root path
     * @property {string|null} sandbox.qemu.customLibDir - Custom library directory
     * @property {Object} sandbox.limits - Resource limits for sandboxed execution
     * @property {number} sandbox.limits.maxFileSize - Maximum file size in bytes
     * @property {number} sandbox.limits.maxFiles - Maximum number of files
     * @property {number} sandbox.limits.maxProcesses - Maximum number of processes
     * @property {number} sandbox.limits.maxOpenFiles - Maximum open files
     * @property {number} sandbox.limits.cpuTime - CPU time limit in seconds
     * @property {Object} sandbox.nsjail - NSJail sandbox settings
     * @property {string} sandbox.nsjail.memory - Memory limit in MB
     * @property {number} sandbox.nsjail.timeout - Execution timeout in milliseconds
     * @property {string} sandbox.nsjail.preferredMethod - Preferred sandbox method
     * @property {string} sandbox.nsjail.libRoot - Library root path
     * @property {string|null} sandbox.nsjail.customLibDir - Custom library directory
     */
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
        },
        nsjail: {
            memory: '64', // MB
            timeout: 30000, // ms
            preferredMethod: 'nsjail', // nsjail, qemu, bubblewrap, firejail, or fallback
            libRoot: '/usr/x86_64-linux-gnu',
            customLibDir: null
        }
    },

    /**
     * @property {Object} filesystem - File system configuration settings
     * @property {string} filesystem.tempDir - Temporary directory path
     * @property {string} filesystem.workDir - Working directory path for job processing
     * @property {Array<string>} filesystem.allowedExtensions - Allowed file extensions for analysis
     */
    filesystem: {
        tempDir: path.join(os.tmpdir(), 'coretrace'),
        workDir: path.join(process.cwd(), 'temp'),
        allowedExtensions: ['.c', '.cpp', '.h', '.hpp']
    },

    /**
     * @property {Object} jobs - Job management configuration
     * @property {number} jobs.cleanupDelay - Delay before job cleanup in milliseconds
     * @property {number} jobs.retentionPeriod - Job retention period in milliseconds
     */
    jobs: {
        cleanupDelay: 60000, // 1 minute
        retentionPeriod: 3600000 // 1 hour
    },

    /**
     * @property {Object} logging - Logging configuration settings
     * @property {string} logging.level - Log level (debug, info, warn, error)
     * @property {string} logging.format - Log format (json, simple)
     */
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'json'
    }
};
