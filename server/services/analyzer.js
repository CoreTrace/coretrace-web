// services/analyzer.js
const fs = require('fs');
const path = require('path');
const { sandboxWithBestMethod } = require('./sandbox');
const config = require('../config');
const logger = require('./logger');
const jobManager = require('./jobManager');
const { parseToolOutputs } = require('./sarifParser');

// In-memory store for analysis jobs (would use a database in production)
const analysisJobs = new Map();

class Analyzer {
    constructor() {
        this.ctraceExecutable = path.join(__dirname, '../../server/bin/ctrace');
        this.testExecutable = path.join(__dirname, '../../server/bin/test');
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
            const result = await this.runAnalysis(execPath, args, job.id, job.workDir);

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

        // Save the uploaded files first
        for (const [filename, content] of Object.entries(files)) {
            const filePath = path.join(workDir, filename);
            fs.writeFileSync(filePath, content);
            filePaths.push(filename);
        }

        // Create the flawfinder directory structure that ctrace expects
        const flawfinderTargetDir = path.join(workDir, 'flawfinder', 'src', 'flawfinder-build');
        fs.mkdirSync(flawfinderTargetDir, { recursive: true });
        console.log('flawfinderTargetDir', flawfinderTargetDir);
        const flawfinderSource = path.join(__dirname, '../bin/flawfinder.py');
        const flawfinderDest = path.join(flawfinderTargetDir, 'flawfinder.py');

        if (fs.existsSync(flawfinderSource)) {
            fs.copyFileSync(flawfinderSource, flawfinderDest);
            fs.chmodSync(flawfinderDest, 0o755);
            console.log("Flawfinder.py copied to", flawfinderDest);
        } else {
            throw new Error(`flawfinder.py not found at ${flawfinderSource}`);
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
            // if (options.tools?.length > 0) {
            //     args.push(`--invoke=${options.tools.join(',')}`);
            // }
            // const reportPath = path.join(workDir, 'report.txt');
            // args.push(`--report-file=${reportPath}`);
            args.push("--sarif-format");
        }

        return args;
    }

    async runAnalysis(execPath, args, jobId, workDir) {
        logger.info('Running analysis in sandbox', { jobId, execPath, args });

        const result = await sandboxWithBestMethod(
            execPath,
            args,
            config.sandbox.qemu.timeout,
            'firejail',
            workDir
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

        const parsed = parseToolOutputs(result.stdout);
        console.log(JSON.stringify(parsed, null, 2));
        console.log(parsed);
        return parsed;
    }

    cleanAnsiCodes(text) {
        if (!text) return '';
        return text.replace(/\u001b\[\d+m|\[\d+m/g, '');
    }
}

// Export singleton instance
module.exports = new Analyzer();