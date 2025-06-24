const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const logger = require('./logger');

class JobManager {
    constructor() {
        this.jobs = new Map();
        this.initializeStorage();
    }

    initializeStorage() {
        // Ensure job storage directory exists
        if (!fs.existsSync(config.filesystem.workDir)) {
            fs.mkdirSync(config.filesystem.workDir, { recursive: true });
        }
    }

    createJob(files, options = {}) {
        const jobId = uuidv4();
        const workDir = path.join(config.filesystem.workDir, jobId);

        // Create job directory
        fs.mkdirSync(workDir, { recursive: true });

        // Initialize job record
        const job = {
            id: jobId,
            status: 'created',
            startTime: new Date(),
            files: Object.keys(files),
            options,
            workDir
        };

        this.jobs.set(jobId, job);
        logger.info('Job created', { jobId, status: job.status });

        return job;
    }

    updateJobStatus(jobId, status, result = null, error = null) {
        const job = this.jobs.get(jobId);
        if (!job) {
            throw new Error(`Job ${jobId} not found`);
        }

        job.status = status;
        job.endTime = new Date();
        if (result) job.result = result;
        if (error) job.error = error;

        this.jobs.set(jobId, job);
        logger.info('Job status updated', { jobId, status });

        // Schedule cleanup if job is completed or failed
        if (status === 'completed' || status === 'failed') {
            this.scheduleCleanup(jobId);
        }

        return job;
    }

    getJob(jobId) {
        return this.jobs.get(jobId);
    }

    scheduleCleanup(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) return;

        // Schedule cleanup after delay
        setTimeout(() => {
            this.cleanupJob(jobId);
        }, config.jobs.cleanupDelay);
    }

    cleanupJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) return;

        try {
            // Remove job directory
            if (fs.existsSync(job.workDir)) {
                fs.rmSync(job.workDir, { recursive: true, force: true });
            }

            // Remove job from memory after retention period
            setTimeout(() => {
                this.jobs.delete(jobId);
            }, config.jobs.retentionPeriod);

            logger.info('Job cleaned up', { jobId });
        } catch (error) {
            logger.error('Error cleaning up job', { jobId, error: error.message });
        }
    }

    validateFiles(files) {
        const errors = [];

        // Check if files are provided
        if (!files || Object.keys(files).length === 0) {
            errors.push('No files provided');
            return errors;
        }

        // Validate each file
        for (const [filename, content] of Object.entries(files)) {
            // Check file extension
            const ext = path.extname(filename).toLowerCase();
            if (!config.filesystem.allowedExtensions.includes(ext)) {
                errors.push(`Invalid file extension for ${filename}`);
            }

            // Check content type
            if (typeof content !== 'string') {
                errors.push(`Invalid content type for ${filename}`);
            }

            // Check file size
            if (content.length > config.sandbox.limits.maxFileSize) {
                errors.push(`File ${filename} exceeds size limit`);
            }
        }

        return errors;
    }
}

// Export singleton instance
module.exports = new JobManager(); 