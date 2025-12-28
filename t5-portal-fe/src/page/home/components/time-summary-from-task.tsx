import { TaskSummaryDto } from "interfaces/dto/task";
import { formatDuration, getRemainingTimeDayJS } from "utility/time";
import { theme } from "antd";
import { roundDecimal } from "utility/number";
import { useState } from "react";
import { useInterval } from "usehooks-ts";

const { useToken } = theme;

export const TimeSummaryFromTask = ({ tasks }: { tasks: TaskSummaryDto[] }) => {
    const { token } = useToken();
    const [remainingTimeInDate, setRemainingTimeInDate] = useState(getRemainingTimeDayJS("Asia/Ho_Chi_Minh"));

    const totalDurationInDate = tasks?.reduce((total, task) => total + (task.time_entry_total_duration_in_date ?? 0), 0);
    const totalWorkDurationInDate = tasks?.filter((task) => task?.task_type === "work").reduce((total, task) => total + (task.time_entry_total_duration_in_date ?? 0), 0);
    const totalBreakDurationInDate = tasks?.filter((task) => task?.task_type === "break").reduce((total, task) => total + (task.time_entry_total_duration_in_date ?? 0), 0);
    const untrackedTimeInDate = (24 * 3600 - remainingTimeInDate) - totalDurationInDate;

    useInterval(() => {
        setRemainingTimeInDate(getRemainingTimeDayJS("Asia/Ho_Chi_Minh"));
    }, 1000);

    return (
        <div className="flex items-center gap-2">
            <div>Remaining time ({roundDecimal((remainingTimeInDate / (24 * 3600)) * 100, 2)}%): <span style={{ color: token.colorPrimary }} className="font-semibold">{formatDuration(remainingTimeInDate)}</span></div>
            <div>{"/"}</div>
            <div>Total Working Time ({roundDecimal((totalWorkDurationInDate / (24 * 3600)) * 100, 2)}%): <span style={{ color: token.green }} className="font-semibold">{formatDuration(totalWorkDurationInDate)}</span></div>
            <div>{"/"}</div>
            <div>Total Break Time ({roundDecimal((totalBreakDurationInDate / (24 * 3600)) * 100, 2)}%): <span style={{ color: token.red }} className="font-semibold">{formatDuration(totalBreakDurationInDate)}</span></div>
            <div>{"/"}</div>
            <div>Vague Thinking Time ({roundDecimal((untrackedTimeInDate / (24 * 3600)) * 100, 2)}%): <span style={{ color: token.gold }} className="font-semibold">{formatDuration(untrackedTimeInDate)}</span></div>
        </div>
    )
};