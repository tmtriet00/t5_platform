import { useList } from "@refinedev/core";
import { TimeEntry } from "interfaces";
import dayjs from "dayjs";

export const useTimelineData = (date: string) => {
    const startOfDay = dayjs(date).startOf('day').toISOString();
    const endOfDay = dayjs(date).endOf('day').toISOString();

    return useList<TimeEntry>({
        resource: "time_entries",
        filters: [
            { field: "start_time", operator: "gte", value: startOfDay },
            { field: "start_time", operator: "lte", value: endOfDay },
        ],
        meta: {
            select: "*, task:tasks(id, name, project:projects(id, name, color))"
        },
        pagination: { mode: "off" }
    });
};
