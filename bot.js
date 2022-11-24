require("dotenv").config();
const { App } = require("@slack/bolt");

const bot = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: process.env.BOT_PORT || 3000
});

bot.event("app_home_opened", async ({ payload, client }) => {
    const userId = payload.user;
    try {
        const view = await messageView.CreateScheduledMessagesView(prisma);
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

(async () => {
    await bot.start();

    console.log("⚡️ Slack bot is running!");
})();