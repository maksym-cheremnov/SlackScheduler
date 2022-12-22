require("dotenv").config();
const { App, LogLevel } = require("@slack/bolt");
const { CreateScheduledMessagesView } = require('./schedule_message_body.js');
const { request } = require("undici");

const bot = new App({
    logLevel: LogLevel.DEBUG,
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
});

bot.event("app_home_opened", async ({ payload, client }) => {
    const userId = payload.user;
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const singleMes = await client.chat.scheduledMessages.list({ oldest: sevenDaysAgo.getTime() / 1000 });
        const view = await CreateScheduledMessagesView(userId, singleMes);
        await client.views.publish({
            user_id: userId,
            view: view
        });
    }
    catch (error) {
        console.error(error);
    }
});

bot.action('message_delete', async ({ ack, payload, logger, client, body }) => {
    await ack();
    const jobId = payload.selected_option.value;
    try {
        const parsedStringArr = jobId.split(',');
        const url = `${process.env.FRONT_URL}/api/cancel_task`;
        request(url, {
            method: "POST",
            data: {
                id: parsedStringArr[0],
                job_id: parsedStringArr[1]
            }
        });

        const view = await CreateScheduledMessagesView(payload.user);
        await client.views.update({
            view_id: body.view.id,
            view: view
        });

    } catch (error) {
        logger.error(error);
    }
});

(async () => {
    await bot.start();
    console.log("⚡️ Slack bot is running!");
})();