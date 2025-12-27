import React, { useMemo } from 'react';
import { Card, Spin, Tooltip, Empty } from 'antd';
import { useTimelineData } from './use-timeline-data';
import dayjs from 'dayjs';
import { TimeEntry } from 'interfaces';

interface TimelineProps {
    date: string;
}

export const TimelineChart: React.FC<TimelineProps> = ({ date }) => {
    // @ts-ignore - useList returns query in this project setup apparently
    const { query } = useTimelineData(date);
    const timeEntries = query?.data?.data || [];
    const isLoading = query?.isLoading;

    const tasksMap = useMemo(() => {
        const map = new Map<number, { task: any, entries: TimeEntry[] }>();
        timeEntries.forEach((entry: TimeEntry) => {
            // Filter out entries that don't belong to the selected date visually (double check)
            // Although hook filters by start_time, let's just process safely.
            if (entry.task) {
                if (!map.has(entry.task.id)) {
                    map.set(entry.task.id, { task: entry.task, entries: [] });
                }
                map.get(entry.task.id)?.entries.push(entry);
            }
        });
        return Array.from(map.values());
    }, [timeEntries]);

    if (isLoading) return (
        <div className="flex justify-center p-4">
            <Spin />
        </div>
    );

    if (tasksMap.length === 0) return null;

    // Configuration
    const startHour = 0;
    const endHour = 24;
    const totalMinutes = (endHour - startHour) * 60;

    const getPosition = (timeStr: string) => {
        const d = dayjs(timeStr);
        const minutes = d.hour() * 60 + d.minute();
        return (minutes / totalMinutes) * 100;
    };

    const getWidth = (start: string, end: string | null) => {
        const s = dayjs(start);
        // If actively tracking (end is null), visualize up to now, but not beyond end of day.
        let e = end ? dayjs(end) : dayjs();

        // Clamp to end of day if it spills over (though filter handles starts, end might be next day)
        const endOfDay = dayjs(date).endOf('day');
        if (e.isAfter(endOfDay)) e = endOfDay;

        let diff = e.diff(s, 'minute');
        if (diff < 0) diff = 0; // Should not happen
        return (diff / totalMinutes) * 100;
    };

    return (
        <Card
            className="mb-6 shadow-sm rounded-none border-t-0 border-x-0 border-b border-gray-200"
            styles={{ body: { padding: "0" } }}
        >
            <div className="flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex border-b border-gray-200 bg-gray-50 h-8">
                    <div className="w-1/4 min-w-[200px] border-r border-gray-200 px-4 flex items-center font-medium text-gray-500 text-xs uppercase tracking-wider">
                        Task
                    </div>
                    <div className="flex-1 relative overflow-hidden">
                        {/* Time Ruler Labels */}
                        {Array.from({ length: 25 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute top-0 bottom-0 text-[10px] text-gray-400 pl-1 leading-8"
                                style={{ left: `${(i / 24) * 100}%` }}
                            >
                                {i}
                            </div>
                        ))}
                    </div>
                    {/* Scroll spacer padding equivalent? No, relative is fine. */}
                </div>

                {/* Rows */}
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {tasksMap.map(({ task, entries }) => (
                        <div key={task.id} className="flex border-b border-gray-100 h-12 hover:bg-gray-50 transition-colors group">
                            <div className="w-1/4 min-w-[200px] border-r border-gray-200 px-4 flex items-center bg-white group-hover:bg-gray-50 z-10">
                                <div className="truncate w-full">
                                    <div className="font-medium text-gray-700 text-sm truncate" title={task.name}>{task.name}</div>
                                    {task.project && (
                                        <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.project.color || '#ccc' }}></span>
                                            <span className="truncate">{task.project.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 relative bg-white">
                                {/* Grid Lines */}
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <div key={i} className="absolute top-0 bottom-0 border-r border-dotted border-gray-200" style={{ left: `${((i + 1) / 24) * 100}%` }} />
                                ))}

                                {/* Blocks */}
                                {entries.map(entry => {
                                    const left = getPosition(entry.start_time);
                                    let width = getWidth(entry.start_time, entry.end_time);
                                    // Minimum width for visibility (e.g. 1 minute)
                                    const minWidth = (1 / totalMinutes) * 100;
                                    if (width < minWidth) width = minWidth;

                                    return (
                                        <Tooltip
                                            key={entry.id}
                                            title={
                                                <div className="text-xs">
                                                    <div>{dayjs(entry.start_time).format('HH:mm')} - {entry.end_time ? dayjs(entry.end_time).format('HH:mm') : 'Now'}</div>
                                                    <div className="text-gray-300">{entry.description || '(No description)'}</div>
                                                </div>
                                            }
                                        >
                                            <div
                                                className="absolute h-6 top-3 rounded-sm shadow-sm cursor-pointer hover:brightness-95 transition-all opacity-80 hover:opacity-100 border border-white/20"
                                                style={{
                                                    left: `${left}%`,
                                                    width: `${width}%`,
                                                    backgroundColor: task.project?.color || '#1890ff',
                                                    minWidth: '2px'
                                                }}
                                            />
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};
