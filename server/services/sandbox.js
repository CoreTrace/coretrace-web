const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

/**
 * Create a sandboxed environment for running code analysis
 * @param {string} jobId - ID of the analysis job
 * @returns {Promise<string>} Path to the sandbox directory
 */
async function createSandbox(jobId) {
    // Create a temporary working directory
    const workDir = path.join(os.tmpdir(), `coretrace-${jobId}`);

    try {
        // Create directory
        console.log(`Creating sandbox at: ${workDir}`);
        fs.mkdirSync(workDir, { recursive: true });

        // Set permissions (more restrictive on Unix-like systems)
        if (process.platform !== 'win32') {
            console.log(`Setting permissions for sandbox: ${workDir}`);
            fs.chmodSync(workDir, 0o750); // rwxr-x---
        }

        return workDir;
    } catch (error) {
        console.error('Error creating sandbox:', error);
        throw new Error('Failed to create sandbox environment');
    }
}

/**
 * Clean up the sandbox after analysis is complete
 * @param {string} workDir - Path to the sandbox directory
 * @returns {Promise<void>}
 */
async function cleanupSandbox(workDir) {
    try {
        // Ensure the path is actually a temporary directory we created
        if (!workDir.includes('coretrace-') || !workDir.startsWith(os.tmpdir())) {
            throw new Error('Invalid sandbox directory');
        }

        // Remove the directory and all its contents
        console.log(`Cleaning up sandbox at: ${workDir}`);
        fs.rmSync(workDir, { recursive: true, force: true });
    } catch (error) {
        console.error('Error cleaning up sandbox:', error);
    }
}

/**
 * Run an executable in a Bubblewrap sandbox
 * @param {string} executablePath - Path to the executable
 * @param {Array} args - Arguments to pass to the executable
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<Object>} Result of the execution
 */
function sandboxWithBubblewrap(executablePath, args = [], timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
        // Ensure the executable exists
        if (!fs.existsSync(executablePath)) {
            return reject(new Error(`Executable not found: ${executablePath}`));
        }

        const execDir = path.dirname(executablePath);
        const execName = path.basename(executablePath);

        // Build bwrap command with security restrictions
        const bwrapArgs = [
            // Mount system directories read-only
            '--ro-bind', '/usr', '/usr',
            '--ro-bind', '/lib', '/lib',
            '--ro-bind', '/lib64', '/lib64',
            '--ro-bind', '/bin', '/bin',
            // Provide /proc but mask sensitive things
            '--proc', '/proc',
            // Provide minimal /dev
            '--dev', '/dev',
            // Provide a temporary directory
            '--tmpfs', '/tmp',
            // Unshare namespaces for better isolation
            '--unshare-all',
            // Create a new process session
            '--new-session',
            // Mount the executable directory with read-only access
            '--ro-bind', execDir, execDir,
            // Change to the executable directory
            '--chdir', execDir,
            // Deny network access
            '--unshare-net',
            // Execute the binary with arguments
            executablePath,
            ...args
        ];

        console.log(`Running with bwrap: ${executablePath} ${args.join(' ')}`);

        const process = spawn('bwrap', bwrapArgs, {
            stdio: 'pipe',
            timeout: timeoutMs
        });

        let stdout = '';
        let stderr = '';

        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        process.on('close', (code) => {
            resolve({
                code,
                stdout,
                stderr,
                success: code === 0
            });
        });

        process.on('error', (err) => {
            // Handle command not found error
            if (err.code === 'ENOENT') {
                reject(new Error('Bubblewrap (bwrap) is not installed. Please install it first.'));
            } else {
                reject(err);
            }
        });

        // Handle timeout
        setTimeout(() => {
            if (!process.killed) {
                process.kill('SIGKILL');
                reject(new Error('Process execution timed out'));
            }
        }, timeoutMs);
    });
}

/**
 * Run an executable in a Firejail sandbox
 * @param {string} executablePath - Path to the executable
 * @param {Array} args - Arguments to pass to the executable
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<Object>} Result of the execution
 */
function sandboxWithFirejail(executablePath, args = [], timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
        // Ensure the executable exists
        if (!fs.existsSync(executablePath)) {
            return reject(new Error(`Executable not found: ${executablePath}`));
        }

        const execDir = path.dirname(executablePath);

        // Build firejail command with security restrictions
        const firejailArgs = [
            '--noprofile',                // Don't use any profiles
            '--quiet',                    // Less verbose output
            '--private=' + execDir,       // Use private sandbox with the executable directory
            '--private-tmp',              // Use private /tmp directory
            '--private-dev',              // Use private /dev directory
            '--caps.drop=all',            // Drop all capabilities
            '--nonewprivs',               // No new privileges
            '--noroot',                   // No fake root user
            '--seccomp',                  // Enable seccomp filtering
            '--net=none',                 // No network access
            '--rlimit-as=' + (500 * 1024 * 1024), // Memory limit (500MB)
            '--rlimit-cpu=30',            // CPU time limit (30 seconds)
            '--rlimit-fsize=10485760',    // File size limit (10MB)
            '--rlimit-nofile=50',         // Open files limit
            '--rlimit-nproc=20',          // Process limit
            executablePath,               // The executable
            ...args                       // Arguments to the executable
        ];

        console.log(`Running with firejail: ${executablePath} ${args.join(' ')}`);

        const process = spawn('firejail', firejailArgs, {
            stdio: 'pipe',
            timeout: timeoutMs
        });

        let stdout = '';
        let stderr = '';

        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        process.on('close', (code) => {
            resolve({
                code,
                stdout,
                stderr,
                success: code === 0
            });
        });

        process.on('error', (err) => {
            // Handle command not found error
            if (err.code === 'ENOENT') {
                reject(new Error('Firejail is not installed. Please install it first.'));
            } else {
                reject(err);
            }
        });

        // Handle timeout
        setTimeout(() => {
            if (!process.killed) {
                process.kill('SIGKILL');
                reject(new Error('Process execution timed out'));
            }
        }, timeoutMs);
    });
}

/**
 * Run an executable in the best available sandbox
 * @param {string} executablePath - Path to the executable
 * @param {Array} args - Arguments to pass to the executable
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} preferredSandbox - 'bubblewrap', 'firejail', or 'fallback'
 * @returns {Promise<Object>} Result of the execution
 */
async function sandboxWithBestMethod(executablePath, args = [], timeoutMs = 10000, preferredSandbox = 'bubblewrap') {
    try {
        // Try the preferred sandbox first
        if (preferredSandbox === 'bubblewrap') {
            try {
                return await sandboxWithBubblewrap(executablePath, args, timeoutMs);
            } catch (bwrapError) {
                console.log("Bubblewrap failed, falling back to firejail:", bwrapError.message);
                // If bubblewrap fails, try firejail
                try {
                    return await sandboxWithFirejail(executablePath, args, timeoutMs);
                } catch (firejailError) {
                    console.log("Firejail failed, falling back to basic sandbox:", firejailError.message);
                    // If both fail, use basic sandbox
                    return await sandboxExecutable(executablePath, args, timeoutMs);
                }
            }
        } else if (preferredSandbox === 'firejail') {
            try {
                return await sandboxWithFirejail(executablePath, args, timeoutMs);
            } catch (firejailError) {
                console.log("Firejail failed, falling back to bubblewrap:", firejailError.message);
                // If firejail fails, try bubblewrap
                try {
                    return await sandboxWithBubblewrap(executablePath, args, timeoutMs);
                } catch (bwrapError) {
                    console.log("Bubblewrap failed, falling back to basic sandbox:", bwrapError.message);
                    // If both fail, use basic sandbox
                    return await sandboxExecutable(executablePath, args, timeoutMs);
                }
            }
        } else {
            // Use the basic sandbox as requested
            return await sandboxExecutable(executablePath, args, timeoutMs);
        }
    } catch (error) {
        console.error("All sandbox methods failed:", error.message);
        throw error;
    }
}

/**
 * sandboxExecutable - Run an executable in a sandboxed environment
 * @param {string} executablePath - Path to the executable
 * @param {Array} args - Arguments to pass to the executable
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<Object>} Result of the execution
 * */
function sandboxExecutable(executablePath, args = [], timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
        // Set resource limits using ulimit on Linux
        const resourceLimits = [
            'ulimit -t 5',     // CPU time (5 seconds)
            'ulimit -n 32',    // Max open files
            // set permission limits
            'ulimit -u 32'    // Max user processes
        ].join('; ');

        // Run command with resource limits
        const cmd = `${resourceLimits}; ${executablePath} ${args.join(' ')}`;
        const process = spawn('bash', ['-c', cmd], {
            cwd: path.dirname(executablePath),
            stdio: 'pipe',
            timeout: timeoutMs,
        });

        let stdout = '';
        let stderr = '';

        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        process.on('close', (code) => {
            resolve({
                code,
                stdout,
                stderr,
                success: code === 0
            });
        });

        process.on('error', (err) => {
            reject(err);
        });

        // Handle timeout
        setTimeout(() => {
            if (!process.killed) {
                process.kill('SIGKILL');
                reject(new Error('Process execution timed out'));
            }
        }, timeoutMs);
    });
}

module.exports = {
    createSandbox,
    cleanupSandbox,
    sandboxWithBubblewrap,
    sandboxWithFirejail,
    sandboxWithBestMethod,
    sandboxExecutable
};