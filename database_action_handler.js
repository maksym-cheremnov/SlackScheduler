const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');
const { jobStatus } = require("./types");

exports.clearAndUpdateOutdatedMessages = async (prisma) => {
    const now = new Date();
    const outdatedMsgs = await prisma.job.deleteMany({
        where: {
            repeat_end_date: {
                lte: now,
            },
        },
    });
    console.log("Messages for deleting:");
    console.log(outdatedMsgs);
    const repeatedMsgs = await prisma.job.findMany({
        where: {
            status: jobStatus.ACTIVE,
        },
    });
    console.log("Messages for updating:");
    console.log(repeatedMsgs);
    // for (let i = 0; i < outdatedMsgs.length; i++)
    // {
    //     if (!outdatedMsgs[i].isRepeated)
    //     {
    //         await prisma.schedule.delete
    //     }
    // }
};

exports.createJob = async (job) => {
    const newJob = await prisma.job.create({ data: { job_id: uuidv4(), status: jobStatus.ACTIVE, message: job.message, pattern_type: job.pattern_type, repeat_end_date: job.repeat_end_date, date: job.date, user: job.user, conversations: job.conversations } });
    console.log(newJob);

    return newJob
}
