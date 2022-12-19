require("dotenv").config();
const { App } = require("@slack/bolt");
const { scheduleJob } = require("node-schedule")
const { PrismaClient } = require("@prisma/client");
const { validateScheduling } = require('./functions.js');
const { getScheduledTimes, getScheduledPattern } = require('./date_planner.js');
const modalView = require(('./modal_view_body.js'));
const { clearAndUpdateOutdatedMessages } = require(('./database_action_handler.js'));
const { customCronType, sendSeveralMsg, getParsedTime } = require('./functions');
const prisma = new PrismaClient();
const { createTask, restoreTasks } = require('./schedule.service.js');
const { cron } = require("cron-validate")
const { cronTypes } = require("./types.js");

const app = new App({
  token: process.env.SLACK_USER_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.USER_PORT || 3000
});

app.shortcut("schedule", async ({ shortcut, ack, client, logger }) => {
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

app.view("new_scheduled_message", async ({ ack, body, view, client, logger }) => {
  try {
    await ack();
    const user = body.user.id;
    const viewValues = view.state.values;
    const post_at = getParsedTime(viewValues);

    switch (viewValues.schedule_repeat.repeat_pattern.selected_option.value) {
      case "none":
        sendSeveralMsg(client, viewValues.conversations.conversations_list.selected_conversations, viewValues.message.message_text.value, post_at.getTime());
        break;
      case "daily":
        await createTask({ pattern_type: cronTypes.daily, repeat_end_date: viewValues.pattern_end.date_value.selected_date, user: user, conversations: viewValues.conversations.conversations_list.selected_conversations, message: viewValues.message.message_text.value, date: post_at });
        break;

      case "weekDay":
        await createTask({ pattern_type: cronTypes.weekDay, repeat_end_date: viewValues.pattern_end.date_value.selected_date, user: user, conversations: viewValues.conversations.conversations_list.selected_conversations, message: viewValues.message.message_text.value, date: post_at });
        break;

      case "weelky":
        await createTask({ pattern_type: cronTypes.weelky, repeat_end_date: viewValues.pattern_end.date_value.selected_date, user: user, conversations: viewValues.conversations.conversations_list.selected_conversations, message: viewValues.message.message_text.value, date: post_at });
        break;

      case "onceTwoWeeks":
        await createTask({ pattern_type: cronTypes.onceTwoWeeks, repeat_end_date: viewValues.pattern_end.date_value.selected_date, user: user, conversations: viewValues.conversations.conversations_list.selected_conversations, message: viewValues.message.message_text.value, date: post_at });
        break;

      case "monthly":
        await createTask({ pattern_type: cronTypes.monthly, repeat_end_date: viewValues.pattern_end.date_value.selected_date, user: user, conversations: viewValues.conversations.conversations_list.selected_conversations, message: viewValues.message.message_text.value, date: post_at });
        break;

      case "custom":
        const customCron = customCronType(viewValues.customDay_repeat.custom_days_selector.selected_options);
        const newCron = cron(customCron);
        if (newCron.isValid()) {
          await createTask({ pattern_type: newCron, repeat_end_date: viewValues.pattern_end.date_value.selected_date, user: user, conversations: viewValues.conversations.conversations_list.selected_conversations, message: viewValues.message.message_text.value, date: post_at });
        }

        break;

    }
  } catch (err) {
    logger.error(err);
  }
})

app.view({ callback_id: 'new_scheduled_message', type: 'view_closed' }, async ({ ack, body, view, client }) => {
  await ack();
});

app.action('repeat_pattern', async ({ action, body, client, ack, logger }) => {
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

scheduleJob('0 0 * * *', async () => {
  await clearAndUpdateOutdatedMessages();
});

(async () => {
  await app.start();
  await restoreTasks();
  console.log("⚡️ Slack app is running!");
})();
