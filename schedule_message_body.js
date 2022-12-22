const { extractMessageFromDatabase } = require("./functions.js");
const { cronTypes } = require('./types');
exports.CreateScheduledMessagesView = async (userId, singleMes) => {
    let blocks = [];
    createHeader(blocks);
    addSingleMessages(blocks, singleMes);
    await createScheduledMsgInfo(blocks, userId, singleMes);
    return JSON.stringify({
        type: "home",
        blocks: blocks,
    });
};

function createHeader(blocks) {
    blocks.push({
        type: "section",
        text: {
            type: "plain_text",
            emoji: true,
            text: "You have next scheduled messages:",
        },
    });
    blocks.push({
        type: "divider",
    });
}
function parseProperCron(value) {
    return Object.entries(cronTypes).find(([_, val]) => value === val)[0];
}

function addSingleMessages(blocks, singleMes) {
    singleMes.scheduled_messages.forEach((mes) => {
        blocks.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: `Scheduled time: *${new Date(mes.post_at)}*\nScheduled pattern: Message without pattern \nMessage scheduled to conversations: ${mes.channel_id}\nMessage text: ${mes.text}`,
            },
            accessory: {
                type: "overflow",
                options: [
                    {
                        text: {
                            type: "plain_text",
                            text: "Delete",
                            emoji: true,
                        },
                        value: `${mes.id}`,
                    },
                ],
                action_id: "single_delete",
            },
        })
    })
}

async function createScheduledMsgInfo(blocks, userId) {
    const messages = await extractMessageFromDatabase(userId);
    messages.forEach(({ date, conversations, message, id, job_id, pattern_type }) => {
        blocks.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: `Scheduled time: *${date.toLocaleTimeString()}*\nScheduled pattern: ${parseProperCron(pattern_type)} \nMessage scheduled to conversations: ${conversations.join(',')}\nMessage text: ${message}`,
            },
            accessory: {
                type: "overflow",
                options: [
                    // {
                    //     text: {
                    //         type: "plain_text",
                    //         text: "View",
                    //         emoji: true,
                    //     },
                    //     value: "view " + id,
                    // },
                    // {
                    //     text: {
                    //         type: "plain_text",
                    //         text: "Edit",
                    //         emoji: true,
                    //     },
                    //     value: "edit " + id,
                    // },
                    {
                        text: {
                            type: "plain_text",
                            text: "Delete",
                            emoji: true,
                        },
                        value: `${id},${job_id}`,
                    },
                ],
                action_id: "message_action",
            },
        });
    });
    // for (let i = 0; i < 8; i++)
    // {
    //     blocks.push({
    //         "type": "section",
    //         "text": {
    //             "type": "mrkdwn",
    //             "text": "*Today - 4:30-5pm*\nEveryone is available: @iris, @zelda"
    //         },
    //         "accessory": {
    //             "type": "button",
    //             "text": {
    //                 "type": "plain_text",
    //                 "emoji": true,
    //                 "text": `Click-${i}`
    //             },
    //             "value": `Click-${i}`
    //         }
    //     });
    // }
};

function putTheRest(blocks) {
    blocks.push({
        type: "section",
        text: {
            type: "mrkdwn",
            text: "*Tomorrow - 6-6:30pm*\nSome people aren't available: @iris, ~@zelda~",
        },
        accessory: {
            type: "button",
            text: {
                type: "plain_text",
                emoji: true,
                text: "Choose",
            },
            value: "click_me_123",
        },
    });
    blocks.push({
        type: "section",
        text: {
            type: "mrkdwn",
            text: "*<fakelink.ToMoreTimes.com|Show more times>*",
        },
    });
}
