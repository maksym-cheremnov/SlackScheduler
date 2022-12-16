require("dotenv").config();
const { prisma } = require("@prisma/client");
const { App } = require("@slack/bolt");
const { CreateScheduledMessagesView } = require('./schedule_message_body.js');
const { cancelTask } = require("./schedule.service");

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

bot.action('message_action', async ({ payload, logger }) => {
    try {
        const jobId = payload.selected_option.value;
        const parsedStringArr = jobId.split(',');
        if (jobId) {
            console.log(jobId.toString())
            console.log("Everything fine");
            const cancelJob = await cancelTask({ id: parsedStringArr[0], job_id: parsedStringArr[1] });
            console.log(cancelJob.toString());
        } else console.log('Something went wrong')

    } catch (error) {
        logger.error(error);
    }
});

(async () => {
    await bot.start();

    console.log("⚡️ Slack bot is running!");
})();