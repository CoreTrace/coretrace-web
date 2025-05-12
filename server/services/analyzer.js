// services/analyzer.js
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const { createSandbox, cleanupSandbox } = require('./sandbox');

// In-memory store for analysis jobs (would use a database in production)
const analysisJobs = new Map();

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

/**
 * Run CoreTrace analysis on the provided files
 * @param {Object} files - Object with filenames as keys and content as values
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Analysis results
 */
async function analyzeCode(files, options) {
    console.log('Starting analysis with files:', files);
    const jobId = uuidv4();
    const workDir = await createSandbox(jobId);

    try {
        console.log(`Initializing job ${jobId} in directory: ${workDir}`);
        initializeJob(jobId, files);
        console.log(`Saving files to work directory: ${workDir}`);
        const filePaths = saveFilesToWorkDir(workDir, files);
        console.log(`Files saved: ${filePaths}`);

        // const command = buildAnalysisCommand(workDir, filePaths, options);
        // console.log(`Executing command: ${command}`);
        // // const result = await executeAnalysis(command, workDir, jobId);
        // const result = await runWithFirejail(command, workDir);
        // Use resources test executable if ctrace doesn't exist
        const ctraceExecutable = path.join(__dirname, '../../server/bin/ctrace');
        const testExecutable = path.join(__dirname, '../../server/bin/resources');

        const execPath = fs.existsSync(ctraceExecutable) ? ctraceExecutable : testExecutable;
        console.log(`Using executable: ${execPath}`);

        // Build arguments
        const args = [];
        if (fs.existsSync(ctraceExecutable)) {
            // Only add these args if using ctrace
            args.push(`--input=${filePaths.join(',')}`);
            if (options.static) args.push('--static');
            if (options.dynamic) args.push('--dyn');
            if (options.tools && options.tools.length > 0) {
                args.push(`--invoke=${options.tools.join(',')}`);
            }
            const reportPath = path.join(workDir, 'report.txt');
            args.push(`--report-file=${reportPath}`);
        }
        console.log(`Executing with args: ${args.join(' ')}`);
        const result = await sandboxExecutable(execPath, args, 30000);
        result.stdout = cleanAnsiCodes(result.stdout);
        result.stderr = cleanAnsiCodes(result.stderr);

        // Add job ID to result
        result.jobId = jobId;
        if (execPath === testExecutable) {
            result.testMode = true;
            result.message = "Using test executable - ctrace not found";
        }

        console.log(`Analysis completed for job ${jobId}:`, result);
        updateJobSuccess(jobId, result);
        console.log(`Job ${jobId} completed successfully`);
        return result;
    } catch (error) {
        updateJobFailure(jobId, error);
        console.error(`Job ${jobId} failed:`, error);
        throw error;
    } finally {
        scheduleCleanup(jobId, workDir);
        console.log(`Scheduled cleanup for job ${jobId} in directory: ${workDir}`);
    }
}

/**
 * Clean ANSI escape sequences from output text
 * @param {string} text - The text containing ANSI escape codes
 * @returns {string} Cleaned text without ANSI codes
 */
function cleanAnsiCodes(text) {
    if (!text) return '';

    // Remove ANSI escape sequences (color codes and control characters)
    // This regex matches patterns like [32m, [0m, [36m, etc.
    return text.replace(/\u001b\[\d+m|\[\d+m/g, '');
}/**
 * Clean ANSI escape sequences from output text
 * @param {string} text - The text containing ANSI escape codes
 * @returns {string} Cleaned text without ANSI codes
 */
function cleanAnsiCodes(text) {
    if (!text) return '';

    // Remove ANSI escape sequences (color codes and control characters)
    // This regex matches patterns like [32m, [0m, [36m, etc.
    return text.replace(/\u001b\[\d+m|\[\d+m/g, '');
}

/**
 * Initialize a new analysis job and record it in the jobs map
 * @param {string} jobId - The unique job identifier
 * @param {Object} files - Files to be analyzed
 */
function initializeJob(jobId, files) {
    analysisJobs.set(jobId, {
        id: jobId,
        status: 'running',
        startTime: new Date(),
        files: Object.keys(files)
    });
}

/**
 * Save submitted files to the working directory
 * @param {string} workDir - Path to the working directory
 * @param {Object} files - Files to save
 * @returns {Array} List of filenames
 */
function saveFilesToWorkDir(workDir, files) {
    const filePaths = [];
    for (const [filename, content] of Object.entries(files)) {
        const filePath = path.join(workDir, filename);
        fs.writeFileSync(filePath, content);
        filePaths.push(filename);
    }
    return filePaths;
}

/**
 * Build the command string for running the analysis
 * @param {string} workDir - Path to the working directory
 * @param {Array} filePaths - List of files to analyze
 * @param {Object} options - Analysis options
 * @returns {string} The command to execute
 */
function buildAnalysisCommand(workDir, filePaths, options) {
    const ctraceExecutable = path.join(__dirname, '../../server/bin/ctrace');
    const segfaultExecutable = path.join(__dirname, '../../server/bin/segfault');
    const fileReadingExecutable = path.join(__dirname, '../../server/bin/file_reading');
    const notifyExecutable = path.join(__dirname, '../../server/bin/notify-send');
    let command = `cd ${workDir} && ${ctraceExecutable}`;

    // Add input files
    command += ` --input=${filePaths.join(',')}`;

    // Add other options
    if (options.static) command += ' --static';
    if (options.dynamic) command += ' --dyn';
    if (options.tools && options.tools.length > 0) {
        command += ` --invoke=${options.tools.join(',')}`;
    }

    // Set output report path
    const reportPath = path.join(workDir, 'report.txt');
    command += ` --report-file=${reportPath}`;

    // command = `${notifyExecutable}`;
    return command;
}

/**
 * Execute the analysis command
 * @param {string} command - Command to execute
 * @param {string} workDir - Path to the working directory
 * @param {string} jobId - The job identifier
 * @returns {Promise<Object>} Analysis results
 */
// function executeAnalysis(command, workDir, jobId) {
//     const reportPath = path.join(workDir, 'report.txt');

//     return new Promise((resolve, reject) => {
//         exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
//             let result = {
//                 success: !error,
//                 stdout: stdout,
//                 stderr: stderr,
//                 report: '',
//                 jobId: jobId
//             };

//             // Try to read the report file
//             try {
//                 if (fs.existsSync(reportPath)) {
//                     result.report = fs.readFileSync(reportPath, 'utf8');
//                 }
//             } catch (err) {
//                 console.error('Error reading report file:', err);
//             }

//             resolve(result);
//         });
//     });
// }

/**
 * Execute the analysis command using sandboxExecutable
 * @param {string} command - Command to execute
 * @param {string} workDir - Path to the working directory
 * @param {string} jobId - The job identifier
 * @returns {Promise<Object>} Analysis results
 */
async function executeAnalysis(command, workDir, jobId) {
    const reportPath = path.join(workDir, 'report.txt');

    // Extract the executable path and arguments from the command
    // This assumes command is in format: cd {workDir} && {executable} {args}
    const cmdParts = command.split('&&');
    if (cmdParts.length < 2) {
        return {
            success: false,
            stdout: '',
            stderr: 'Invalid command format',
            report: '',
            jobId: jobId
        };
    }

    const execPart = cmdParts[1].trim();
    const execArgs = execPart.split(' ');
    const execPath = execArgs.shift(); // Get the executable path

    console.log(`Using sandboxExecutable with: ${execPath} ${execArgs.join(' ')}`);

    try {
        // Check if executable exists
        if (!fs.existsSync(execPath)) {
            console.error(`Executable not found: ${execPath}`);

            // Fall back to a test executable that we know exists
            const testExecPath = path.join(__dirname, '../../server/bin/resources');

            if (fs.existsSync(testExecPath)) {
                console.log(`Falling back to test executable: ${testExecPath}`);

                const execResult = await sandboxExecutable(testExecPath, [], 30000);

                return {
                    success: execResult.success,
                    stdout: execResult.stdout,
                    stderr: execResult.stderr,
                    code: execResult.code,
                    report: 'Using test executable - original not found',
                    jobId: jobId,
                    testMode: true
                };
            } else {
                throw new Error(`Neither original nor test executable found`);
            }
        }

        // Run the executable in the sandbox
        const execResult = await sandboxExecutable(execPath, execArgs, 30000);

        let result = {
            success: execResult.success,
            stdout: execResult.stdout,
            stderr: execResult.stderr,
            code: execResult.code,
            report: '',
            jobId: jobId
        };

        // Try to read the report file
        try {
            if (fs.existsSync(reportPath)) {
                result.report = fs.readFileSync(reportPath, 'utf8');
            }
        } catch (err) {
            console.error('Error reading report file:', err);
        }

        return result;
    } catch (error) {
        console.error(`Error executing sandboxed command: ${error.message}`);
        return {
            success: false,
            stdout: '',
            stderr: error.message,
            report: '',
            jobId: jobId
        };
    }
}

async function runWithFirejail(command, workDir) {
    const firejailCommand = `firejail --noprofile --quiet --private=${workDir} --noroot --seccomp ${command}`;
    console.log(`Running command in firejail: ${firejailCommand}`);
    return new Promise((resolve, reject) => {
        exec(firejailCommand, { timeout: 30000 }, (error, stdout, stderr) => {
            resolve({ success: !error, stdout, stderr });
        });
    });
}

// async function executeAnalysis(command, workDir, jobId) {
//     const reportPath = path.join(workDir, 'report.txt');

//     // First fix your buildAnalysisCommand function
//     // Currently returning only the notify executable
//     const ctraceExecutable = path.join(__dirname, '../../server/bin/ctrace');

//     try {
//         // Parse the command to get the executable and arguments
//         // This is just a simple example - you'll need to adjust based on your needs
//         const execPath = ctraceExecutable;
//         const args = [
//             `--input=${filePaths.join(',')}`,
//             options.static ? '--static' : '',
//             options.dynamic ? '--dyn' : '',
//             options.tools && options.tools.length > 0 ? `--invoke=${options.tools.join(',')}` : '',
//             `--report-file=${reportPath}`
//         ].filter(arg => arg !== ''); // Remove empty args

//         // Run the executable in the sandbox
//         const execResult = await sandboxExecutable(execPath, args, 30000);

//         let result = {
//             success: execResult.success,
//             stdout: execResult.stdout,
//             stderr: execResult.stderr,
//             code: execResult.code,
//             report: '',
//             jobId: jobId
//         };

//         // Try to read the report file
//         try {
//             if (fs.existsSync(reportPath)) {
//                 result.report = fs.readFileSync(reportPath, 'utf8');
//             }
//         } catch (err) {
//             console.error('Error reading report file:', err);
//         }

//         return result;
//     } catch (error) {
//         console.error(`Error executing sandboxed command: ${error.message}`);
//         return {
//             success: false,
//             stdout: '',
//             stderr: error.message,
//             report: '',
//             jobId: jobId
//         };
//     }
// }


/**
 * Update job status on successful completion
 * @param {string} jobId - The job identifier
 * @param {Object} result - Analysis results
 */
function updateJobSuccess(jobId, result) {
    analysisJobs.set(jobId, {
        ...analysisJobs.get(jobId),
        status: 'completed',
        endTime: new Date(),
        result: result
    });
}

/**
 * Update job status on failure
 * @param {string} jobId - The job identifier
 * @param {Error} error - The error that occurred
 */
function updateJobFailure(jobId, error) {
    analysisJobs.set(jobId, {
        ...analysisJobs.get(jobId),
        status: 'failed',
        endTime: new Date(),
        error: error.message
    });
}

/**
 * Schedule cleanup of resources
 * @param {string} jobId - The job identifier
 * @param {string} workDir - Working directory to clean up
 */
function scheduleCleanup(jobId, workDir) {
    // Schedule cleanup after a delay to allow status retrieval
    setTimeout(() => {
        cleanupSandbox(workDir);
        // Remove job from memory after some retention period
        setTimeout(() => {
            analysisJobs.delete(jobId);
        }, 3600000); // 1 hour retention
    }, 60000); // 1 minute delay before cleanup
}

/**
 * Get the status of an analysis job
 * @param {string} jobId - ID of the analysis job
 * @returns {Object|null} Job status or null if not found
 */
function getAnalysisStatus(jobId) {
    return analysisJobs.get(jobId) || null;
}

module.exports = {
    analyzeCode,
    getAnalysisStatus
};
