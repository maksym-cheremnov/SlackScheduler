require("dotenv").config();
const { App } = require("@slack/bolt");
const cron = require("node-schedule");
const { PrismaClient } = require("@prisma/client");
// const func = require('./Functions.js')
const modalView = require(('./ModalViewBody.js'))

const prisma = new PrismaClient();

const app = new App({
  token: process.env.SLACK_USER_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode:true,
  appToken:process.env.SLACK_APP_TOKEN,
  port:process.env.PORT || 3000
});

const bot = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode:true,
  appToken:process.env.SLACK_APP_TOKEN,
  port:process.env.PORT || 3000
});

bot.event("app_home_opened", async ({ payload, client }) => {
const userId = payload.user;

try {
  // Call the views.publish method using the WebClient passed to listeners
  const result = await client.views.publish({
  user_id: userId,
  view: messageView.CreateScheduledMessagesView()
  });

  console.log(result);
}
catch (error) {
  console.error(error);
}
});

bot.message('update_schedule_command', async ({message, client}) =>{
  try{
      const update = await client.chat.update({
          channel:message.channel,
          ts: message.ts,
          as_user:true,
          text: "Hey, update has been worked"
    });
  }
  catch(error){
    console.log(error);
  }
});

app.message('update_schedule_command', async ({message, client, logger}) =>{
  try{
    const result = await client.chat.postMessage({
      channel: message.channel,
      as_user:true,
      text: "Hey, update has been worked"
    });
  }
  catch(error){
    console.log(error);
  }
});

app.command('/update_schedule_command', async ({command, ack, say, respond}) =>{
  try{
    await ack();
    await respond({
      response_type:'delete_original',
      text:"Hey command here"
    });
  }
  catch(error){
    console.log(error);
  }
});

// app.options('hour_selector', async ({ options, ack }) => {
//     const date = new Date(options.view.state.values.date.datepicker_input.selected_date);
//     const startHour = func.isToday(date) ? new Date().getHours() : undefined;
//     const res = func.getHoursOptions(startHour);
//     await ack({
//       "options": res
//     });
// });



// app.options('minutes_selector', async ({ options, ack }) => {
//   const date = new Date(options.view.state.values.date.datepicker_input.selected_date);
//   const hour = options.view.state.values.time_selector.hour_selector.selected_value;
//   const now = new Date();
//   const startMinute = func.isToday(date) && now.getHours() == hour ? now.getMinutes() + 1 : undefined;
//   const res = func.getMinutesOptions(startMinute);
//   await ack({
//     "options": res
//   });
// });

// app.action("timepicker-action", async({body, ack})=>{
//   await ack();
//   return validateScheduling()
// })

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

app.view("schedule", async ({ ack, body, view, client, logger }) => {
  try {
    await ack();

    const user = body.user.id;
    const sValues = view.state.values;
    const message = sValues.message.input.value;
    const date = new Date(sValues.date.input.selected_date);
    const time = parseTime(sValues.time.input.selected_time);
    const users = sValues.users.select.selected_users;
    const channels = sValues.channels.select.selected_channels;
    const conversations = sValues.conversations.select.selected_conversations;

    const dateFormat = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
      0
    );

    if (validateScheduling(dateFormat))
    {
      await prisma.schedule.create({
        data: {
          user,
          message,
          date: dateFormat,
          users,
          channels,
          conversations,
        },
      });
      
      const channelId = conversations.at(0);
      try {
        const schedule_result = await client.chat.scheduleMessage({
          channel:channelId,
          text:message,
          post_at:dateFormat.getTime() / 1000,
          as_user:true
        });
        console.log(schedule_result);

        const reminder_result = await client.reminders.add({
          text:message,
          time:dateFormat.getTime()/1000,
          team_id:body.team_id
        })

        const result = await client.chat.postEphemeral({
          channel: channelId,
          user: user,
          as_user:true,
          text: "Shhhh I'll tell you a secret soon :shushing_face:"
        });
        console.log(result);
      }
      catch (error) {
        console.error(error);
      }
    }
    const messages = await prisma.schedule.findMany({
      where: {
        date: {
          lte: new Date(),
        },
      },
    });
    messages.forEach(element => {
      console.log(element);
    });

  } catch (error) {
    logger.error(error);
  }
});

app.view({ callback_id: 'schedule', type: 'view_closed' }, async ({ ack, body, view, client }) => {
  await ack();
});

cron.scheduleJob("* * * * *", async () => {
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
});

(async () => {
  await app.start();

  console.log("⚡️ Bot app is running!");
})();
