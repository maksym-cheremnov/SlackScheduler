exports.cronTypes = {
    daily: "0 0 * * *",
    weekDay: "0 0 * * 1-5",
    weelky: "0 0 * * 1",
    onceTwoWeeks: "0 0 1,15 * *",
    custom: "0 0 * * 0-6",
}

exports.jobStatus = {
    ACTIVE: "ACTIVE",
    DONE: "DONE",
    CANCEL: "CANCEL",
}