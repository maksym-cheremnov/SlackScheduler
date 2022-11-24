const func = require("./Functions.js");
exports.CreateScheduledMessagesView = async (prisma) => {
    let blocks = [];
    createHeader(blocks);
    await createScheduledMsgInfo(prisma, blocks);
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

createScheduledMsgInfo = async (prisma, blocks) => {
    const messages = await func.extractMessageFromDatabase(prisma);
    messages.forEach((element) => {
        blocks.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*${element.date}*\nMessage scheduled to conversations:\nMessage text:${element.message}`,
            },
            accessory: {
                type: "overflow",
                options: [
                    {
                        text: {
                            type: "plain_text",
                            text: "View",
                            emoji: true,
                        },
                        value: "view",
                    },
                    {
                        text: {
                            type: "plain_text",
                            text: "Edit",
                            emoji: true,
                        },
                        value: "edit",
                    },
                    {
                        text: {
                            type: "plain_text",
                            text: "Delete",
                            emoji: true,
                        },
                        value: "delete",
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
