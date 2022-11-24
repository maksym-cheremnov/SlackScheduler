const now = new Date();

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

exports.extractMessageFromDatabase = async (prisma) => {
    const time = new Date();
    const messages = await prisma.schedule.findMany({
        where: {
            date: {
                lte: time,
            },
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

exports.slackScheduleMsg = async (channelId, messageText, execTime) => {
    try {
        await client.chat.scheduleMessage({
            channel: channelId,
            text: messageText,
            post_at: execTime.getTime() / 1000,
            as_user: true
        });
    } catch (error) {
        console.error(error);
    }
}

exports.customCronType = (arr) => {
    let cronString = "0 0 * * ";
    arr.map(val => {
        cronString += val + ',';
    })

    const parsedCron = cronString.slice(0, cronString.length - 1)
    return parsedCron

}
