require("dotenv").config();
const { App } = require("@slack/bolt");
const { CreateScheduledMessagesView } = require('./schedule_message_body.js');
const { cancelTask, restoreTasks } = require("./schedule.service");
const modalView = require(('./modal_view_body.js'));
const { createJob } = require(('./database_action_handler.js'));
const { sendSeveralMsg, customCronType, getParsedTime } = require('./functions');
const { cron } = require("cron-validate")


const bot = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: process.env.BOT_PORT || 3001
});

bot.event("updateMapper", ({ event, client }) => {
    console.log(event);
    console.log(client);
});

bot.view("new_scheduled_message", async ({ ack, body, view, client, logger }) => {
    try {
        await ack();
        const user = body.user.id;
        const viewValues = view.state.values;
        const post_at = getParsedTime(viewValues);
        const repeatedPattern = viewValues.schedule_repeat.repeat_pattern.selected_option.value;

        switch (repeatedPattern) {
            case "none":
                sendSeveralMsg(client, viewValues.conversations.conversations_list.selected_conversations, viewValues.message.message_text.value, post_at.getTime());
                break;
            case "daily":
                await createJob({ pattern_type: cronTypes.daily, repeat_end_date: viewValues.pattern_end.date_value.selected_date, user: user, conversations: viewValues.conversations.conversations_list.selected_conversations, message: viewValues.message.message_text.value, date: post_at });
                break;

            case "weekDay":
                await createJob({ pattern_type: cronTypes.weekDay, repeat_end_date: viewValues.pattern_end.date_value.selected_date, user: user, conversations: viewValues.conversations.conversations_list.selected_conversations, message: viewValues.message.message_text.value, date: post_at });
                break;

            case "weelky":
                await createJob({ pattern_type: cronTypes.weelky, repeat_end_date: viewValues.pattern_end.date_value.selected_date, user: user, conversations: viewValues.conversations.conversations_list.selected_conversations, message: viewValues.message.message_text.value, date: post_at });
                break;

            case "onceTwoWeeks":
                await createJob({ pattern_type: cronTypes.onceTwoWeeks, repeat_end_date: viewValues.pattern_end.date_value.selected_date, user: user, conversations: viewValues.conversations.conversations_list.selected_conversations, message: viewValues.message.message_text.value, date: post_at });
                break;

            case "monthly":
                await createJob({ pattern_type: cronTypes.monthly, repeat_end_date: viewValues.pattern_end.date_value.selected_date, user: user, conversations: viewValues.conversations.conversations_list.selected_conversations, message: viewValues.message.message_text.value, date: post_at });
                break;

            case "custom":
                const customCron = customCronType(viewValues.customDay_repeat.custom_days_selector.selected_options);
                const newCron = cron(customCron);
                if (newCron.isValid()) {
                    await createJob({ pattern_type: newCron, repeat_end_date: viewValues.pattern_end.date_value.selected_date, user: user, conversations: viewValues.conversations.conversations_list.selected_conversations, message: viewValues.message.message_text.value, date: post_at });
                }

                break;

        }
    } catch (err) {
        logger.error(err);
    }
})

bot.action('repeat_pattern', async ({ action, body, client, ack, logger }) => {
    await ack();
    try {
        const viewVal = modalView.CreateModalView(body.view.private_metadata, action.selected_option);
        await client.views.update({
            view: viewVal,
            view_id: body.view.id
        });
    }
    catch (error) {
        logger.error(error);
    }
});

bot.shortcut("schedule", async ({ shortcut, ack, client, logger }) => {
    try {
        await ack();
        const view = modalView.CreateModalView();
        await client.views.open({
            trigger_id: shortcut.trigger_id,
            view: view
        });
    } catch (error) {
        logger.error(error);
    }
});
// bot.event("app_home_opened", async ({ payload, client }) => {
//     const userId = payload.user;
//     try {
//         const view = await CreateScheduledMessagesView(userId);
//         // Call the views.publish method using the WebClient passed to listeners
//         const result = await client.views.publish({
//             user_id: userId,
//             view: view
//         });

//         console.log(result);
//     }
//     catch (error) {
//         console.error(error);
//     }
// });

bot.action('message_action', async (event) => {
    await event.ack();
    try {
        const jobId = event.payload.selected_option.value;
        if (jobId) {
            const parsedStringArr = jobId.split(',');
            await cancelTask({ id: parsedStringArr[0], job_id: parsedStringArr[1] });
        } else console.log('Something went wrong')
        event.action('delete message')
        const view = await CreateScheduledMessagesView(event.payload.user);

        await client.views.publish({
            user_id: event.payload.user,
            view: view
        });
    } catch (error) {
        logger.error(error);
    }
});

(async () => {
    await bot.start();
    await restoreTasks();
    console.log("⚡️ Slack bot is running!");
})();