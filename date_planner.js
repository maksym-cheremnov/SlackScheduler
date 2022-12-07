const msInDay = 86_400_000;
const msInWeek = 7 * msInDay;

exports.getScheduledTimes = (viewValues) => {
    const now = new Date();
    const selected_date = new Date(viewValues.date.date_value.selected_date);
    const selected_time = parseTime(viewValues.time.time_value.selected_time);
    const scheduled_pattern = this.getScheduledPattern(viewValues);
    const selected_custom_days =
        viewValues.customDay_repeat?.custom_days_selector?.selected_options ??
        [];
    const selected_end_date = viewValues.pattern_end?.date_value?.selected_date;
    const scheduled_end_date =
        selected_end_date != undefined
            ? new Date(selected_end_date)
            : undefined;
    scheduled_end_date?.setHours(
        selected_time.getHours(),
        selected_time.getMinutes(),
        0,
        0
    );

    const firstSheduleEntry = new Date(selected_date);
    firstSheduleEntry.setHours(
        selected_time.getHours(),
        selected_time.getMinutes(),
        0,
        0
    );
    const currentWeekStart = new Date(
        firstSheduleEntry.getTime() - selected_date.getDay() * msInDay
    );

    const scheduledTimes = [];
    switch (scheduled_pattern) {
        case "daily":
            scheduledTimes = getWithOffsetUntil(
                msInDay,
                firstSheduleEntry,
                scheduled_end_date
            );
            break;
        case "weekDaily":
            {
                const currDay = firstSheduleEntry.getDay();
                for (let i = 0; i < 5; i++) {
                    const includeFirstEntry = i < currDay;
                    scheduledTimes.push(
                        getWithOffsetUntil(
                            msInWeek,
                            currentWeekStart + i * msInDay,
                            scheduled_end_date,
                            includeFirstEntry
                        )
                    );
                }
            }
            break;
        case "weekly":
            scheduledTimes = getWithOffsetUntil(
                msInWeek,
                firstSheduleEntry,
                scheduled_end_date
            );
            break;
        case "twoWeeks":
            const msIn2Weeks = 14 * msInDay;
            scheduledTimes = getWithOffsetUntil(
                msIn2Weeks,
                firstSheduleEntry,
                scheduled_end_date
            );
            break;
        case "montly":
            let timeWithOffset = new Date(firstSheduleEntry.getTime());
            while (timeWithOffset < scheduled_end_date) {
                scheduledTimes.push(timeWithOffset);
                timeWithOffset.setMonth(timeWithOffset.getMonth() + 1);
            }
            break;
        case "customDays":
            {
                const currDay = firstSheduleEntry.getDay();
                for (let i = 0; i < 7; i++) {
                    if (selected_custom_days.includes(i)) {
                        const includeFirstEntry = i < currDay;
                        scheduledTimes.push(
                            getWithOffsetUntil(
                                msInWeek,
                                currentWeekStart + i * msInDay,
                                scheduled_end_date,
                                includeFirstEntry
                            )
                        );
                    }
                }
            }
            break;
        default:
            scheduledTimes.push(firstSheduleEntry);
            break;
    }

    return firstSheduleEntry;
};

function getWithOffsetUntil(
    offset,
    startDate,
    endDate = undefined,
    includeFirstEntry = true
) {
    const scheduledTimes = [];
    if (endDate != undefined && endDate > startDate) return scheduledTimes;

    let endOfSchedule = getFarthestMomentForScheduling(new Date());
    if (endDate != undefined && endOfSchedule < endDate)
        endOfSchedule = endDate;

    let timeWithOffset = new Date(startDate.getTime());
    if (!includeFirstEntry)
        timeWithOffset.setTime(timeWithOffset.getTime() + offset);

    while (timeWithOffset < endOfSchedule) {
        scheduledTimes.push(timeWithOffset);
        timeWithOffset.setTime(timeWithOffset.getTime() + offset);
    }

    return scheduledTimes;
}

exports.getScheduledPattern = (viewValues) => {
    let selected_repeat =
        viewValues.schedule_repeat.repeat_pattern.selected_option.value;
    if (selected_repeat == "customDays") {
        const selected_days_options =
            viewValues.customDay_repeat.custom_days_selector.selected_options;
        if (selected_days_options.length == 7) selected_repeat = "daily";
        else if (
            selected_days_options.length == 5 &&
            !selected_days_options.some(isWeekend)
        )
            selected_repeat = "weekDaily";
        else if (selected_days_options.length == 1) selected_repeat = "weekly";
    }

    return selected_repeat;
};

exports.getFarthestMomentForScheduling = (date, onlyDay = false) => {
    const lastMoment = new Date(date.getTime() + 120 * msInDay);
    if (onlyDay) lastMoment.setHours(0, 0, 0, 0);

    return lastMoment;
};

exports.isTimeValidForScheduling = (time) => {
    return time.getTime() < this.getFarthestDayForScheduling(new Date());
};

function parseTime(t) {
    const d = new Date();
    const time = t.match(/(\d+)(?::(\d\d))?\s*(p?)/);
    d.setHours(parseInt(time[1]) + (time[3] ? 12 : 0));
    d.setMinutes(parseInt(time[2]) || 0);
    return d;
}

function isWeekend(day) {
    return day.value == "sat" || day.value == "sun";
}
