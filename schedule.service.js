const { scheduleJob } = require("node-schedule");
const { PrismaClient } = require("@prisma/client");
const { slackScheduleMsg, postMessage, sleep } = require('./functions');
const { createJob } = require("./database_action_handler");
const { v4: uuidv4 } = require('uuid');
const { jobStatus } = require("./types");

exports.JobsMapper = new Map();
const prisma = new PrismaClient();

exports.createTask = async (pattern_type, repeat_end_date, user, conversations, message) => {
    const job = await createJob({ job_id: uuidv4(), status: jobStatus.ACTIVE, pattern_type, repeat_end_date, user, conversations, message});
    await this.addTask(job);
}

exports.cancelTask = (job_id) => {
    this.cancelSchedule(job_id);
    prisma.job.update({
        where: {
            job_id: job_id
        }, data: {
            status: jobStatus.CANCEL,
        }
    })

}

exports.addTask = async (job) => {
    const cb = (job) => {
        if (job.conversations) {
            job.conversations.forEach((conversation) => {
                postMessage(conversation, job.message);
                sleep(1000);
            })
        }
    }

    this.newSchedule(job.pattern_type, job.job_id, () => { return cb(job) })
}

exports.restoreTasks = async () => {
    const jobs = await prisma.job.findMany({
        where: {
            status: jobStatus.ACTIVE
        }
    })

    jobs.forEach(job => {
        if (job.status === jobStatus.ACTIVE && job.repeat_end_date > new Date()) {
            this.addTask(job);
        }
    })
}

exports.newSchedule = (time, id, cb) => {
    const job = scheduleJob(time, cb);
    this.JobsMapper.set(id, job);
}

exports.cancelSchedule = (uuid) => {
    if (this.JobsMapper.has(uuid)) {
        this.JobsMapper.get(uuid).cancel();
        this.JobsMapper.delete(uuid);
    }
}