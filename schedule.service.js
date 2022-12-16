const { scheduleJob } = require("node-schedule");
const { PrismaClient } = require("@prisma/client");
const { postMessage, sleep } = require('./functions');
const { createJob } = require("./database_action_handler");
const { jobStatus } = require("./types");

const JobsMapper = new Map();
const prisma = new PrismaClient();


exports.createTask = async (data) => {
    const job = await createJob(data);
    await this.addTask(job);
}

exports.cancelTask = async (job_id) => {
    this.cancelSchedule(job_id);
    await prisma.job.update({
        where: {
            job_id: job_id
        }, data: {
            status: jobStatus.CANCEL,
        }
    })

}

exports.addTask = async (job) => {
    try {
        const cb = (job) => {
            const jobDate = new Date(job.date);
            const now = new Date();
            now.setHours(jobDate.getHours());
            now.setMinutes(jobDate.getMinutes());
            now.setSeconds(0)
            now.setMilliseconds(0)
            if (job.conversations) {
                job.conversations.map((conversation) => {
                    postMessage(conversation, job.message, now);
                    sleep(1000);
                })
            }
        }

        this.newSchedule(job.pattern_type, job.job_id, () => { return cb(job) })

    } catch (error) {
        console.log(error)
    }

}

exports.restoreTasks = async () => {
    try {
        const jobs = await prisma.job.findMany({
            where: {
                status: jobStatus.ACTIVE
            }
        })

        jobs.forEach(job => {
            if (job.status === jobStatus.ACTIVE && job.repeat_end_date > new Date()) {
                this.addTask(job);
            }
        });
    } catch (error) {
        console.log(error);
    }

}

exports.newSchedule = (time, id, cb) => {
    const job = scheduleJob(time, cb);
    JobsMapper.set(id, job);
}

exports.cancelSchedule = (uuid) => {
    if (JobsMapper.has(uuid)) {
        JobsMapper.get(uuid).cancel();
        JobsMapper.delete(uuid);
    } else console.log("Something went wrong on cancel job with id :" + uuid);
}