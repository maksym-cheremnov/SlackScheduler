require("dotenv").config();
const { App } = require("@slack/bolt");
const { scheduleJob } = require("node-schedule")
const { PrismaClient } = require("@prisma/client");
const { validateScheduling } = require('./functions.js');
const { getScheduledTimes, getScheduledPattern } = require('./date_planner.js');
const modalView = require(('./modal_view_body.js'));
const database = require(('./database_action_handler.js'));
const { slackScheduleMsg, customCronType, sendSeveralMsg} = require('./functions');
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
    const message_text = viewValues.message.message_text.value;
    const endDate_text = viewValues.pattern_end?.date_value?.selected_date ?? "";
    const selected_repeat = viewValues.schedule_repeat.repeat_pattern.selected_option.value;
    const isRepeated = selected_repeat !== "none";
    const selected_days_options = selected_repeat === "customDays" ? viewValues.customDay_repeat?.custom_days_selector?.selected_options : [];
    const selected_users = viewValues.users.users_list.selected_users;
    const selected_channels = viewValues.channels.channels_list.selected_channels;
    const selected_conversations = viewValues.conversations.conversations_list.selected_conversations;
    const selected_days = new Array(selected_days_options.length);
    selected_days_options.forEach(elem => {
      selected_days.push(elem.value);
    });

    const scheduledDateTime = getScheduledTimes(viewValues);
    const scheduledPattern = getScheduledPattern(viewValues);

    if (validateScheduling(scheduledDateTime)) {
      await prisma.schedule.create({
        data: {
          user,
          message: message_text,
          date: scheduledDateTime,
          isRepeated,
          repeat_pattern: scheduledPattern,
          repeat_custom_days: selected_days,
          repeat_end_date: endDate_text,
          users: selected_users,
          channels: selected_channels,
          conversations: selected_conversations,
        },
      });

      try {
        for (const element of selected_conversations) {
          const schedule_result = await client.chat.scheduleMessage({
            channel: element,
            text: message_text,
            post_at: scheduledDateTime.getTime() / 1000,
            as_user: true
          });
          console.log(schedule_result);
          const msgs = await client.chat.scheduledMessages.list();
          console.log("Already scheduled messages:");
          console.log(msgs);
        }
        const result = await client.chat.postEphemeral({
          channel: body.user.id,
          user: user,
          as_user: true,
          text: "Shhhh I'll tell you a secret soon :shushing_face:"
        });
        console.log(result);
      }
      catch (error) {
        console.error(error);
      }
    }
  } catch (error) {
    logger.error(error);
  }
});

app.view("new_scheduled_message", async ({ ack, body, view, client, logger }) => {
  try {
    await ack();
    const user = body.user.id;
    const viewValues = view.state.values;
    switch (viewValues.schedule_repeat.repeat_pattern.selected_option.value) {
      case "none":
        sendSeveralMsg(client, viewValues.)
        break;
      case "daily":
        createTask(cronTypes.daily, viewValues.pattern_end.date_value.selected_date, user, viewValues.users.users_list.selected_users, viewValues.channels.channels_list.selected_channels, viewValues.conversations.conversations_list.selected_conversations);
        break;

      case "weekDay":
        createTask(cronTypes.weekDay, viewValues.pattern_end.date_value.selected_date, user, viewValues.users.users_list.selected_users, viewValues.channels.channels_list.selected_channels, viewValues.conversations.conversations_list.selected_conversations);
        break;

      case "weelky":
        createTask(cronTypes.weelky, viewValues.pattern_end.date_value.selected_date, user, viewValues.users.users_list.selected_users, viewValues.channels.channels_list.selected_channels, viewValues.conversations.conversations_list.selected_conversations);
        break;

      case "onceTwoWeeks":
        createTask(cronTypes.onceTwoWeeks, viewValues.pattern_end.date_value.selected_date, user, viewValues.users.users_list.selected_users, viewValues.channels.channels_list.selected_channels, viewValues.conversations.conversations_list.selected_conversations);
        break;

      case "monthly":
        createTask(cronTypes.monthly, viewValues.pattern_end.date_value.selected_date, user, viewValues.users.users_list.selected_users, viewValues.channels.channels_list.selected_channels, viewValues.conversations.conversations_list.selected_conversations);
        break;

      case "custom":
        const customCron = customCronType(viewValues.customDay_repeat.custom_days_selector.selected_options);
        const newCron = cron(customCron);
        if (newCron.isValid()) {
          createTask(newCron, viewValues.pattern_end.date_value.selected_date, user, viewValues.users.users_list.selected_users, viewValues.channels.channels_list.selected_channels, viewValues.conversations.conversations_list.selected_conversations);
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

// cron.schedule("* * 1 * *", async () => {
scheduleJob("*/5 * * * *", async () => {
  try {
    await database.clearAndUpdateOutdatedMessages(prisma);
    const time = new Date();
    const messages = await prisma.schedule.findMany({
      where: {
        date: {
          lte: time
        },
      },
    });
    console.log(`${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`);
    console.log(messages);
  }
  catch (error) {
    console.error(error);
  }
});

(async () => {
  await app.start();
  await restoreTasks();
  console.log("⚡️ Slack app is running!");
})();
