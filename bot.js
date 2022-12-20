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

bot.event("app_home_opened", async ({ payload, client }) => {
    const userId = payload.user;
    try {
        const view = await CreateScheduledMessagesView(userId);
        // Call the views.publish method using the WebClient passed to listeners
        const result = await client.views.publish({
            user_id: userId,
            view: view
        });

        console.log(result);
    }
    catch (error) {
        console.error(error);
    }
});

bot.action('message_action', async ({payload, ack, client, body, logger}) => {
    try {
        await ack();
        const jobId = payload.selected_option.value;
        if (jobId) {
            const parsedStringArr = jobId.split(',');
            await cancelTask({ id: parsedStringArr[0], job_id: parsedStringArr[1] });
        } else console.log('Something went completly wrong');

        const view = await CreateScheduledMessagesView(payload.user);

        await client.views.update({
            view: view,
            view_id: body.view.id
        });
    } catch (error) {
        logger.error(error);
    }
});

(async () => {
    await bot.start();

    console.log("⚡️ Slack bot is running!");
})();