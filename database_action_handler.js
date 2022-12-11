const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

exports.clearAndUpdateOutdatedMessages = async (prisma) => {
    const now = new Date();
    const outdatedMsgs = await prisma.schedule.deleteMany({
        where: {
            OR: [
                {
                    AND: [
                        {
                            date: {
                                lte: now,
                            },
                        },
                        {
                            isRepeated: {
                                equals: false,
                            },
                        },
                    ],
                },
                {
                    AND: [
                        {
                            repeat_end_date: {
                                lte: now,
                            },
                        },
                        {
                            isRepeated: {
                                equals: true,
                            },
                        },
                    ],
                },
            ],
        },
    });
    console.log("Messages for deleting:");
    console.log(outdatedMsgs);
    const repeatedMsgs = await prisma.schedule.findMany({
        where: {
            AND: [
                {
                    date: {
                        lte: now,
                    },
                },
                {
                    isRepeated: {
                        equals: true,
                    },
                },
            ],
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

exports.createJob = (job) => {
    prisma.job.create(job);
}