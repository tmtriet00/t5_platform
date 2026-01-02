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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 w-full">
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                <span className="text-gray-500 text-xs uppercase font-semibold">Remaining</span>
                <div className="flex items-baseline gap-1 mt-1">
                    <span style={{ color: token.colorPrimary }} className="text-lg font-bold">{formatDuration(remainingTimeInDate)}</span>
                    <span className="text-xs text-gray-400">({roundDecimal((remainingTimeInDate / (24 * 3600)) * 100, 0)}%)</span>
                </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                <span className="text-gray-500 text-xs uppercase font-semibold">Working</span>
                <div className="flex items-baseline gap-1 mt-1">
                    <span style={{ color: token.green }} className="text-lg font-bold">{formatDuration(totalWorkDurationInDate)}</span>
                    <span className="text-xs text-gray-400">({roundDecimal((totalWorkDurationInDate / (24 * 3600)) * 100, 0)}%)</span>
                </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                <span className="text-gray-500 text-xs uppercase font-semibold">Break</span>
                <div className="flex items-baseline gap-1 mt-1">
                    <span style={{ color: token.red }} className="text-lg font-bold">{formatDuration(totalBreakDurationInDate)}</span>
                    <span className="text-xs text-gray-400">({roundDecimal((totalBreakDurationInDate / (24 * 3600)) * 100, 0)}%)</span>
                </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                <span className="text-gray-500 text-xs uppercase font-semibold">Vague</span>
                <div className="flex items-baseline gap-1 mt-1">
                    <span style={{ color: token.gold }} className="text-lg font-bold">{formatDuration(untrackedTimeInDate)}</span>
                    <span className="text-xs text-gray-400">({roundDecimal((untrackedTimeInDate / (24 * 3600)) * 100, 0)}%)</span>
                </div>
            </div>
        </div>
    )
};