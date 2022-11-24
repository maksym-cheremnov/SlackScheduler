const func = require('./Functions.js');
exports.CreateModalView = (metadata = "") => JSON.stringify({
    type: "modal",
    callback_id: "schedule",
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
    blocks: [
        {
            type: "input",
            block_id: "message",
            element: {
                type: "plain_text_input",
                multiline: true,
                action_id: "input",
            },
            optional: true,
            label: {
                type: "plain_text",
                text: "Message",
                emoji: true,
            },
        },
        {
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
                action_id: "datepicker_input",
            },
            label: {
                type: "plain_text",
                text: "Date to schedule",
                emoji: true,
            },
        },
        {
            type: "divider"
        },
		{
			type: "section",
			text: {
				type: "plain_text",
				text: "Time to schedule",
				emoji: true
			}
		},
        {
            type:"actions",
            block_id:"time_selector",
            elements:[
                {
                    type:"external_select",
                    placeholder:{
                        type:"plain_text",
                        text:"Select an hour",
                        emoji:true
                    },
                    min_query_length: 0,
                    // options: func.getHoursOptions(),
                    action_id:"hour_selector"
                },
                {
                    type:"external_select",
                    placeholder:{
                        type:"plain_text",
                        text:"Select a minute",
                        emoji:true
                    },
                    min_query_length: 0,
                    // options: func.getMinutesOptions(),
                    action_id:"minutes_selector"
                }
            ]
        },
        {
            type: "divider"
        },
        {
            type: "input",
            optional: true,
            block_id: "users",
            element: {
                type: "multi_users_select",
                placeholder: {
                    type: "plain_text",
                    text: "Select users",
                    emoji: true,
                },
                action_id: "select",
            },
            label: {
                type: "plain_text",
                text: "User",
                emoji: true,
            },
        },
        {
            type: "input",
            optional: true,
            block_id: "channels",
            element: {
                type: "multi_channels_select",
                placeholder: {
                    type: "plain_text",
                    text: "Select channels",
                    emoji: true,
                },
                action_id: "select",
            },
            label: {
                type: "plain_text",
                text: "Channels",
                emoji: true,
            },
        },
        {
            type: "input",
            optional: true,
            block_id: "conversations",
            element: {
                type: "multi_conversations_select",
                default_to_current_conversation: true,
                placeholder: {
                    type: "plain_text",
                    text: "Select channels",
                    emoji: true,
                },
                action_id: "select",
            },
            label: {
                type: "plain_text",
                text: "Conversations",
                emoji: true,
            },
        },
    ]
});
