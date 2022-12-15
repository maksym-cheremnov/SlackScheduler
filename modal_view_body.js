const func = require("./functions.js");
exports.CreateModalView = (metadata = "", pattern = "none") => {
    let blocks = [];
    createMessageBlock(blocks);
    setRepeatPatternOptions(pattern, blocks);
    createRecepientBlock(blocks);
    return JSON.stringify({
        type: "modal",
        callback_id: "new_scheduled_message",
        private_metadata: metadata,
        title: {
            type: "plain_text",
            text: "Schedule message",
            emoji: true,
        },
        submit: {
            type: "plain_text",
            text: "Submit",
            emoji: true,
        },
        close: {
            type: "plain_text",
            text: "Cancel",
            emoji: true,
        },
        blocks: blocks,
    });
};

function createMessageBlock(blocks) {
    blocks.push({
        type: "input",
        block_id: "message",
        element: {
            type: "plain_text_input",
            multiline: true,
            action_id: "message_text",
        },
        label: {
            type: "plain_text",
            text: "Message",
            emoji: true,
        },
    });
    blocks.push({
        type: "divider",
    });
}

function setRepeatPatternOptions(selectedPattern, blocks) {
    setSelectedPattern(selectedPattern, blocks);
    createCustomDaysSelector(selectedPattern, blocks);
    setDateTimeOption(selectedPattern, blocks);
}

function setSelectedPattern(selectedPattern, blocks) {
    const value = selectedPattern.value ?? "none";
    const text = selectedPattern?.text?.text ?? "Don't repeat message";
    blocks.push({
        type: "section",
        block_id: "schedule_repeat",
        text: {
            type: "mrkdwn",
            text: "*Select repeat pattern*",
        },
        accessory: {
            type: "static_select",
            action_id: "repeat_pattern",
            initial_option: {
                value: `${value}`,
                text: {
                    type: "plain_text",
                    text: `${text}`,
                },
            },
            options: [
                {
                    value: "none",
                    text: {
                        type: "plain_text",
                        text: "Don't repeat message",
                    },
                },
                {
                    value: "daily",
                    text: {
                        type: "plain_text",
                        text: "Every day",
                    },
                },
                {
                    value: "weekDay",
                    text: {
                        type: "plain_text",
                        text: "Every week day",
                    },
                },
                {
                    value: "weekly",
                    text: {
                        type: "plain_text",
                        text: "Every week",
                    },
                },
                {
                    value: "onceTwoWeeks",
                    text: {
                        type: "plain_text",
                        text: "Every two weeks",
                    },
                },
                {
                    value: "monthly",
                    text: {
                        type: "plain_text",
                        text: "Every month",
                    },
                },
                {
                    value: "customDays",
                    text: {
                        type: "plain_text",
                        text: "Custom days",
                    },
                },
            ],
        },
    });
}


function setDateTimeOption(selectedPattern, blocks) {
    blocks.push({
        type: "input",
        block_id: "date",
        element: {
            type: "datepicker",
            initial_date: func.getCurrentDate(),
            placeholder: {
                type: "plain_text",
                text: "Select a date",
                emoji: true,
            },
            action_id: "date_value",
        },
        label: {
            type: "plain_text",
            text: "Date to schedule",
            emoji: true,
        },
    });
    blocks.push({
        type: "input",
        block_id: "time",
        element: {
            type: "timepicker",
            placeholder: {
                type: "plain_text",
                text: "Select a time",
                emoji: true,
            },
            action_id: "time_value",
        },
        label: {
            type: "plain_text",
            text: "Time",
            emoji: true,
        },
    });
    blocks.push({
        type: "divider",
    });
    if ((selectedPattern?.value ?? "none") != "none") {
        blocks.push({
            type: "input",
            block_id: "pattern_end",
            optional: false,
            element: {
                type: "datepicker",
                placeholder: {
                    type: "plain_text",
                    text: "Select a date",
                    emoji: true,
                },
                action_id: "date_value",
            },
            label: {
                type: "plain_text",
                text: "Last valid day for the scheduled message:",
                emoji: true,
            },
        });
        blocks.push({
            type: "divider",
        });
    }
}

function createCustomDaysSelector(selectedPattern, blocks) {
    if ((selectedPattern?.value ?? "none") == "customDays") {
        blocks.push({
            type: "input",
            block_id: "customDay_repeat",
            label: {
                type: "plain_text",
                text: "Choose custom days",
                emoji: true,
            },
            element: {
                type: "multi_static_select",
                placeholder: {
                    type: "plain_text",
                    text: "Set custom days",
                    emoji: true,
                },
                options: [
                    {
                        value: "1",
                        text: {
                            type: "plain_text",
                            text: "Monday",
                        },
                    },
                    {
                        value: "2",
                        text: {
                            type: "plain_text",
                            text: "Tuesday",
                        },
                    },
                    {
                        value: "3",
                        text: {
                            type: "plain_text",
                            text: "Wednesday",
                        },
                    },
                    {
                        value: "4",
                        text: {
                            type: "plain_text",
                            text: "Thursday",
                        },
                    },
                    {
                        value: "5",
                        text: {
                            type: "plain_text",
                            text: "Friday",
                        },
                    },
                    {
                        value: "6",
                        text: {
                            type: "plain_text",
                            text: "Saturday",
                        },
                    },
                    {
                        value: "7",
                        text: {
                            type: "plain_text",
                            text: "Sunday",
                        },
                    },
                ],
                action_id: "custom_days_selector",
            },
        });
    }
}

function createRecepientBlock(blocks) {
    // blocks.push({
    //     type: "input",
    //     optional: true,
    //     block_id: "users",
    //     element: {
    //         type: "multi_users_select",
    //         placeholder: {
    //             type: "plain_text",
    //             text: "Select users",
    //             emoji: true,
    //         },
    //         action_id: "users_list",
    //     },
    //     label: {
    //         type: "plain_text",
    //         text: "User",
    //         emoji: true,
    //     },
    // });
    // blocks.push({
    //     type: "input",
    //     optional: true,
    //     block_id: "channels",
    //     element: {
    //         type: "multi_channels_select",
    //         placeholder: {
    //             type: "plain_text",
    //             text: "Select channels",
    //             emoji: true,
    //         },
    //         action_id: "channels_list",
    //     },
    //     label: {
    //         type: "plain_text",
    //         text: "Channels",
    //         emoji: true,
    //     },
    // });
    blocks.push({
        type: "input",
        block_id: "conversations",
        element: {
            type: "multi_conversations_select",
            default_to_current_conversation: true,
            placeholder: {
                type: "plain_text",
                text: "Select conversations",
                emoji: true,
            },
            action_id: "conversations_list",
        },
        label: {
            type: "plain_text",
            text: "Conversations",
            emoji: true,
        },
    });
}
