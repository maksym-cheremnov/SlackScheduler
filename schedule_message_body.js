const { extractMessageFromDatabase } = require("./functions.js");

exports.CreateScheduledMessagesView = async (userId) => {
    let blocks = [];
    createHeader(blocks);
    await createScheduledMsgInfo(blocks, userId);
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

async function createScheduledMsgInfo(blocks, userId){
    const messages = await extractMessageFromDatabase(userId);
    messages.forEach(({ date, conversations, message, job_id }) => {
        blocks.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*${date}*\nMessage scheduled to conversations: ${conversations.join(',')}\nMessage text:${message}`,
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
                        value: job_id,
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
