// services/analyzer.js
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const { createSandbox, cleanupSandbox, sandboxWithBestMethod } = require('./sandbox');
const config = require('../config');
const logger = require('./logger');
const jobManager = require('./jobManager');

// In-memory store for analysis jobs (would use a database in production)
const analysisJobs = new Map();

class Analyzer {
    constructor() {
        this.ctraceExecutable = path.join(__dirname, '../../server/bin/ctrace');
        this.testExecutable = path.join(__dirname, '../../server/bin/resources');
    }

    async analyzeCode(files, options) {
        logger.info('Starting analysis', { files: Object.keys(files), options });

        // Validate files
        const validationErrors = jobManager.validateFiles(files);
        if (validationErrors.length > 0) {
            throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }

        // Create job
        const job = jobManager.createJob(files, options);

        try {
            // Save files to work directory
            const filePaths = this.saveFilesToWorkDir(job.workDir, files);
            logger.info('Files saved', { jobId: job.id, filePaths });

            // Get executable path
            const execPath = this.getExecutablePath();
            logger.info('Using executable', { jobId: job.id, execPath });

            // Build arguments
            const args = this.buildArguments(filePaths, options, job.workDir);
            logger.info('Built arguments', { jobId: job.id, args });

            // Run analysis in sandbox
            const result = await this.runAnalysis(execPath, args, job.id);
            
            // Update job status
            jobManager.updateJobStatus(job.id, 'completed', result);
            
            return result;
        } catch (error) {
            logger.error('Analysis failed', { jobId: job.id, error: error.message });
            jobManager.updateJobStatus(job.id, 'failed', null, error.message);
            throw error;
        }
    }

    getExecutablePath() {
        return fs.existsSync(this.ctraceExecutable) ? this.ctraceExecutable : this.testExecutable;
    }

    saveFilesToWorkDir(workDir, files) {
        const filePaths = [];
        for (const [filename, content] of Object.entries(files)) {
            const filePath = path.join(workDir, filename);
            fs.writeFileSync(filePath, content);
            filePaths.push(filename);
        }
        return filePaths;
    }

    buildArguments(filePaths, options, workDir) {
        const args = [];
        const execPath = this.getExecutablePath();

        if (execPath === this.ctraceExecutable) {
            args.push(`--input=${filePaths.join(',')}`);
            if (options.static) args.push('--static');
            if (options.dynamic) args.push('--dyn');
            if (options.tools?.length > 0) {
                args.push(`--invoke=${options.tools.join(',')}`);
            }
            const reportPath = path.join(workDir, 'report.txt');
            args.push(`--report-file=${reportPath}`);
        }

        return args;
    }

    async runAnalysis(execPath, args, jobId) {
        logger.info('Running analysis in sandbox', { jobId, execPath, args });

        const result = await sandboxWithBestMethod(
            execPath,
            args,
            config.sandbox.qemu.timeout,
            config.sandbox.qemu.preferredMethod
        );

        // Clean output
        result.stdout = this.cleanAnsiCodes(result.stdout);
        result.stderr = this.cleanAnsiCodes(result.stderr);

        // Add job ID and test mode flag
        result.jobId = jobId;
        if (execPath === this.testExecutable) {
            result.testMode = true;
            result.message = "Using test executable - ctrace not found";
        }

        return result;
    }

    cleanAnsiCodes(text) {
        if (!text) return '';
        return text.replace(/\u001b\[\d+m|\[\d+m/g, '');
    }
}

// Export singleton instance
module.exports = new Analyzer();