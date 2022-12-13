{
  message: {
    message_text: {
      type: "plain_text_input",
        value: "Some new message with pattern",
    },
  },
  schedule_repeat: {
    repeat_pattern: {
      type: "static_select",
        selected_option: {
        text: {
          type: "plain_text",
            text: "Every day",
              emoji: true,
        },
        value: "daily",
      },
    },
  },
  date: {
    date_value: {
      type: "datepicker",
        selected_date: "2022-12-7",
    },
  },
  time: {
    time_value: {
      type: "timepicker",
        selected_time: "00:00",
    },
  },
  users: {
    users_list: {
      type: "multi_users_select",
        selected_users: [
          "U0235M0K747",
        ],
    },
  },
  channels: {
    channels_list: {
      type: "multi_channels_select",
        selected_channels: [
        ],
    },
  },
  conversations: {
    conversations_list: {
      type: "multi_conversations_select",
        selected_conversations: [
          "C049EAT1TN0",
          "U0235M0K747",
        ],
    },
  },
  pattern_end: {
    date_value: {
      type: "datepicker",
        selected_date: "2022-12-11",
    },
  },
}