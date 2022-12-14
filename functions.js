const { PrismaClient } = require("@prisma/client");
const { request } = require("undici");
const { parseTime } = require("./date_planner");
const now = new Date();
const prisma = new PrismaClient();

exports.validateScheduling = (scheduled) => {
    const today = new Date().getDate();
    const nowtime = new Date().getTime();
    // const isValid = scheduled.some(
    //     (val) => val.getDate() >= today && val.getTime() > nowtime
    // );
    return scheduled.getDate() >= today && scheduled.getTime() > nowtime;
};

exports.validateDate = (dateVal) => {
    return (
        dateVal.getFullYear() >= now.getFullYear() &&
        dateVal.getMonth() >= now.getMonth() &&
        dateVal.getDate() >= now.getDate()
    );
};

exports.isToday = (dateVal) => {
    return (
        dateVal.getFullYear() == now.getFullYear() &&
        dateVal.getMonth() == now.getMonth() &&
        dateVal.getDate() == now.getDate()
    );
};

exports.sleep = ms => {
    new Promise(r => setTimeout(r, ms));
}

exports.getCurrentDate = () => {
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

exports.getCurrentTime = () => {
    const minutes = now.getMinutes();
    return `${now.getHours()}:${minutes < 10 ? `0${minutes}` : `${minutes}`}`;
};

exports.getHoursOptions = (currHour = 0) => {
    const max = 24;
    return createOptionsArray(currHour, max);
};

exports.getMinutesOptions = (date) => {
    let start = 0;
    const max = 60;
    return createOptionsArray(start, max);
};

function createOptionsArray(startVal, maxVal) {
    let options = [];
    for (let i = startVal; i < maxVal; i++) {
        let textVal = i < 10 ? `0${i}` : `${i}`;
        options.push({
            text: {
                type: "plain_text",
                text: `${textVal}`,
                emoji: false,
            },
            value: `${textVal}`,
        });
    }

    return options;
}

exports.createScheduledMsgs = async (client, channel_id, text) => {
    const time = new Date();
    time.setMilliseconds(0);
    time.setSeconds(0);
    time.setMinutes(time.getMinutes() + 5);
    for (let i = 0; i < 6; i++) {
        const postTime = time.getTime() / 1000;
        const schedule_result = await client.chat.scheduleMessage({
            channel: channel_id,
            text: text,
            post_at: postTime,
            as_user: true,
        });
        console.log(schedule_result);
        time.setDate(time.getDate() + 1);
    }
};

exports.extractMessageFromDatabase = async (userId) => {
    const time = new Date();
    const messages = await prisma.job.findMany({
        where: {
            date: {
                lte: time,
            },
            user: userId,
            status: 'ACTIVE'
        },
    });

    return messages;
};

exports.getCustomDaysOptions = (needCustom) => {
    const defaultValue = "None";
    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    let options = [];
    if (needCustom) {
        weekDays.forEach((elem) => {
            options.push({
                text: {
                    type: "plain_text",
                    text: `${elem}`,
                    emoji: false,
                },
                value: `${elem}`,
            });
        });
    } else {
        options.push({
            text: {
                type: "plain_text",
                text: `${defaultValue}`,
                emoji: false,
            },
            value: `${defaultValue}`,
        });
    }
    return options;
};

exports.slackScheduleMsg = async (client, channelId, messageText, execTime) => {
    try {
        await client.chat.scheduleMessage({
            channel: channelId,
            text: messageText,
            post_at: execTime / 1000,
            as_user: true
        });
    } catch (error) {
        console.error(error);
    }
}

exports.customCronType = (arr) => {
    const parsedArr = arr.sort((a, b) => { return a - b });
    let cronString = "0 0 * * ";
    parsedArr.map(val => {
        cronString += val + ',';
    })
    const parsedCron = cronString.slice(0, cronString.length - 1)
    return parsedCron
}

exports.postMessage = (channelId, messageText, execTime) => {
    const parsedTime = execTime.getTime() / 1000
    request(`https://slack.com/api/chat.scheduleMessage?channel=${channelId}&post_at=${parsedTime}&text=${messageText}&pretty=1`, { method: "POST", headers: { authorization: "Bearer " + process.env.SLACK_BOT_TOKEN } })
}

exports.sendSeveralMsg = (client, conversations, messageText, execTime) => {
    conversations.forEach((conversation) => {
        this.slackScheduleMsg(client, conversation, messageText, execTime)
        this.sleep(1000)
    })
}

exports.getParsedTime = (viewValues) => {
    const selected_date = new Date(viewValues.date.date_value.selected_date);
    const selected_time = parseTime(viewValues.time.time_value.selected_time);
    const firstSheduleEntry = new Date(selected_date);
    firstSheduleEntry.setHours(
        selected_time.getHours(),
        selected_time.getMinutes(),
        0,
        0
    );
    return firstSheduleEntry
}