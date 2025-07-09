/**
 * @module JobManager
 * @description Manages analysis jobs including creation, status tracking, validation, and cleanup.
 * Provides job lifecycle management and file validation for the analysis system.
 */

const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const logger = require('./logger');

/**
 * @class JobManager
 * @description Handles the complete lifecycle of analysis jobs including creation, tracking, and cleanup.
 * Maintains job state in memory and manages file system operations for job directories.
 */
class JobManager {
    /**
     * @constructor
     * @description Initializes the job manager with job storage and ensures work directory exists.
     */
    constructor() {
        this.jobs = new Map();
        this.initializeStorage();
    }

    /**
     * @method initializeStorage
     * @description Ensures the job storage directory exists for file operations.
     * Creates the work directory if it doesn't exist.
     */
    initializeStorage() {
        // Ensure job storage directory exists
        if (!fs.existsSync(config.filesystem.workDir)) {
            fs.mkdirSync(config.filesystem.workDir, { recursive: true });
        }
    }

    /**
     * @method createJob
     * @description Creates a new analysis job with unique ID and work directory.
     * @param {Object} files - Object containing filename-content pairs of files to analyze
     * @param {Object} [options={}] - Analysis options and configuration
     * @returns {Object} Job object with id, status, startTime, files, options, and workDir
     */
    createJob(files, options = {}) {
        console.log('createJob');
        const jobId = uuidv4();
        const workDir = path.join(config.filesystem.workDir, jobId);
        console.log('workDir', workDir);

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

    /**
     * @method updateJobStatus
     * @description Updates the status of an existing job and optionally stores results or errors.
     * @param {string} jobId - Unique job identifier
     * @param {string} status - New status for the job ('created', 'running', 'completed', 'failed')
     * @param {Object} [result=null] - Analysis results to store with the job
     * @param {string} [error=null] - Error message if job failed
     * @returns {Object} Updated job object
     * @throws {Error} When job with specified ID is not found
     */
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
            //this.scheduleCleanup(jobId);
        }

        return job;
    }

    /**
     * @method getJob
     * @description Retrieves a job by its unique identifier.
     * @param {string} jobId - Unique job identifier
     * @returns {Object|null} Job object if found, null otherwise
     */
    getJob(jobId) {
        return this.jobs.get(jobId);
    }

    /**
     * @method scheduleCleanup
     * @description Schedules cleanup of a job after a configurable delay.
     * @param {string} jobId - Unique job identifier to schedule cleanup for
     */
    scheduleCleanup(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) return;

        // Schedule cleanup after delay
        setTimeout(() => {
            this.cleanupJob(jobId);
        }, config.jobs.cleanupDelay);
    }

    /**
     * @method cleanupJob
     * @description Performs cleanup operations for a job including file removal and memory cleanup.
     * @param {string} jobId - Unique job identifier to cleanup
     */
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

    /**
     * @method validateFiles
     * @description Validates uploaded files for security, size, and format requirements.
     * @param {Object} files - Object containing filename-content pairs to validate
     * @returns {Array<string>} Array of validation error messages, empty if validation passes
     */
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