import { fillTheGapOfBaseTaskEvents, findDueTaskEvents } from './task_schedule';
import { TaskEvent } from 'interfaces/dto/task';
import dayjs from 'dayjs';
import { describe, it, expect } from 'vitest';


describe('fillTheGapOfBaseTaskEvents', () => {
    const createEvent = (title: string, startStr: string, endStr: string): TaskEvent => {
        const start = dayjs(startStr).toDate();
        const end = dayjs(endStr).toDate();
        return { title, start, end, task_id: 'default', backgroundColor: 'blue' };
    };

    it('should return base tasks when no new tasks are provided', () => {
        const baseEvents = [
            createEvent('Base 1', '2023-01-01T10:00:00', '2023-01-01T11:00:00')
        ];
        const result = fillTheGapOfBaseTaskEvents(baseEvents, []);
        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('Base 1');
    });

    it('should schedule a new task in a gap without splitting if it fits', () => {
        const baseEvents = [
            createEvent('Base 1', '2023-01-01T10:00:00', '2023-01-01T11:00:00'),
            createEvent('Base 2', '2023-01-01T12:00:00', '2023-01-01T13:00:00')
        ];
        // Gap is 11:00 - 12:00 (1 hour). New task: 30 mins (11:00 - 11:30)
        const newTask = createEvent('New 1', '2023-01-01T11:00:00', '2023-01-01T11:30:00');

        const result = fillTheGapOfBaseTaskEvents(baseEvents, [newTask]);

        // Expect 2 base tasks + 1 new task
        expect(result).toHaveLength(3);

        const scheduledTask = result.find(t => t.title === 'New 1');
        expect(scheduledTask).toBeDefined();
        expect(dayjs(scheduledTask!.start).format('HH:mm')).toBe('11:00');
        expect(dayjs(scheduledTask!.end).format('HH:mm')).toBe('11:30');
    });

    it('should split a new task if it overlaps with a base task', () => {
        const baseEvents = [
            createEvent('Base 1', '2023-01-01T10:00:00', '2023-01-01T11:00:00'),
            createEvent('Base 2', '2023-01-01T11:30:00', '2023-01-01T12:00:00')
        ];

        // New task: 11:00 - 12:00 (1 hour)
        // Should fill 11:00-11:30, skip Base 2 (11:30-12:00), then fill 12:00-12:30 (remaining 30mins)
        const newTask = createEvent('New 1', '2023-01-01T11:00:00', '2023-01-01T12:00:00');

        const result = fillTheGapOfBaseTaskEvents(baseEvents, [newTask]);

        // 2 base events + 2 parts of New 1
        expect(result).toHaveLength(4);

        const newEvents = result.filter(t => t.title === 'New 1').sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());
        expect(newEvents).toHaveLength(2);

        // Part 1: 11:00 - 11:30 -> 11:00 - 11:29 (stop 1 min before Base 2 starts at 11:30)
        expect(dayjs(newEvents[0].start).format('HH:mm')).toBe('11:00');
        expect(dayjs(newEvents[0].end).format('HH:mm')).toBe('11:29');

        // Part 2: 12:00 - 12:30 -> 12:01 - 12:32 (31 mins remaining)
        expect(dayjs(newEvents[1].start).format('HH:mm')).toBe('12:01');
        expect(dayjs(newEvents[1].end).format('HH:mm')).toBe('12:32');
    });

    it('should handle completely blocked start time by shifting to next available slot', () => {
        const baseEvents = [
            createEvent('Base 1', '2023-01-01T10:00:00', '2023-01-01T11:00:00')
        ];

        // New task: 10:30 - 11:00 (overlaps with Base 1)
        // Duration 30 mins. Should shift to 11:00 - 11:30
        const newTask = createEvent('New 1', '2023-01-01T10:30:00', '2023-01-01T11:00:00');

        const result = fillTheGapOfBaseTaskEvents(baseEvents, [newTask]);

        const newEvents = result.filter(t => t.title === 'New 1');
        expect(newEvents).toHaveLength(1);

        expect(dayjs(newEvents[0].start).format('HH:mm')).toBe('11:01');
        expect(dayjs(newEvents[0].end).format('HH:mm')).toBe('11:31');
    });

    it('should fill multiple sequential gaps', () => {
        const baseEvents = [
            createEvent('Base 1', '2023-01-01T10:00:00', '2023-01-01T11:00:00'),
            createEvent('Base 2', '2023-01-01T12:00:00', '2023-01-01T13:00:00'),
            createEvent('Base 3', '2023-01-01T14:00:00', '2023-01-01T15:00:00')
        ];

        // New task: 11:00 - 13:30 (2.5 hours = 9000s)
        // Gap 1: 11:00 - 12:00 (1h)
        // Skip Base 2
        // Gap 2: 13:00 - 14:00 (1h)
        // Skip Base 3
        // Gap 3: 15:00 - 15:30 (0.5h) to complete 2.5h total
        const newTask = createEvent('New Long', '2023-01-01T11:00:00', '2023-01-01T13:30:00');

        const result = fillTheGapOfBaseTaskEvents(baseEvents, [newTask]);

        const newEvents = result.filter(t => t.title === 'New Long').sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());
        expect(newEvents).toHaveLength(3);

        expect(dayjs(newEvents[0].start).format('HH:mm')).toBe('11:00');
        expect(dayjs(newEvents[0].end).format('HH:mm')).toBe('11:59');

        // Part 2: 13:00 - 14:00 -> 13:01 - 13:59 (blocked by Base 2 ending at 13:00, stop 1 min before Base 3 starts at 14:00)
        expect(dayjs(newEvents[1].start).format('HH:mm')).toBe('13:01');
        expect(dayjs(newEvents[1].end).format('HH:mm')).toBe('13:59');

        // Part 3: 15:00 - 15:30 -> 15:01 - 15:34
        // Logic: Total duration 2.5h (150m).
        // Part 1: 11:00-11:59 (59m). Remaining: 91m.
        // Part 2: 13:01-13:59 (58m). Remaining: 33m.
        // Part 3: 15:01 + 33m = 15:34.
        expect(dayjs(newEvents[2].start).format('HH:mm')).toBe('15:01');
        expect(dayjs(newEvents[2].end).format('HH:mm')).toBe('15:34');
    });

    it('complex case', () => {
        const baseEvents = [
            createEvent('Base 1', '2023-01-01T23:40:00Z', '2023-01-02T06:40:00Z'),
        ];

        const newTask = [
            createEvent('New Long 1', '2023-01-01T23:27:00Z', '2023-01-01T23:57:00Z'),
            createEvent('New Long 2', '2023-01-01T23:58:00Z', '2023-01-02T00:58:00Z'),
            createEvent('New Long 3', '2023-01-02T00:58:00Z', '2023-01-02T01:18:00Z'),
        ]

        const result = fillTheGapOfBaseTaskEvents(baseEvents, newTask);

        expect(JSON.parse(JSON.stringify(result))).toEqual([
            {
                title: 'Base 1',
                start: "2023-01-01T23:40:00.000Z",
                end: "2023-01-02T06:40:00.000Z",
                task_id: 'default',
                backgroundColor: 'blue'
            },
            {
                title: 'New Long 1',
                start: "2023-01-01T23:27:00.000Z",
                end: "2023-01-01T23:39:00.000Z",
                task_id: 'default',
                backgroundColor: 'blue'
            },
            {
                title: 'New Long 1',
                start: "2023-01-02T06:41:00.000Z",
                end: "2023-01-02T06:59:00.000Z",
                task_id: 'default',
                backgroundColor: 'blue'
            },
            {
                title: 'New Long 2',
                start: "2023-01-02T07:00:00.000Z",
                end: "2023-01-02T08:00:00.000Z",
                task_id: 'default',
                backgroundColor: 'blue'
            },
            {
                title: 'New Long 3',
                start: "2023-01-02T08:01:00.000Z",
                end: "2023-01-02T08:21:00.000Z",
                task_id: 'default',
                backgroundColor: 'blue'
            }
        ]);
    });
    it('should skip gaps smaller than minDuration', () => {
        const baseEvents = [
            createEvent('Base 1', '2023-01-01T10:00:00', '2023-01-01T11:00:00'),
            createEvent('Base 2', '2023-01-01T11:05:00', '2023-01-01T12:00:00')
        ];
        // Gap is 11:00 - 11:05 (5 mins). minDuration is 10 mins.
        // Task is 30 mins.
        // Should skip the 5 min gap and start after Base 2 (12:00 + 1 min buffer -> 12:01)
        const newTask = createEvent('New Split', '2023-01-01T11:00:00', '2023-01-01T11:30:00');

        const result = fillTheGapOfBaseTaskEvents(baseEvents, [newTask], 10);

        const newEvents = result.filter(t => t.title === 'New Split');
        expect(newEvents).toHaveLength(1);
        expect(dayjs(newEvents[0].start).format('HH:mm')).toBe('12:01');
        expect(dayjs(newEvents[0].end).format('HH:mm')).toBe('12:31');
    });

    it('should discard remaining task part if it is smaller than minDuration', () => {
        const baseEvents = [
            createEvent('Base 1', '2023-01-01T10:00:00', '2023-01-01T11:00:00'),
            // Gap 1 hour (11:00 - 12:00)
            createEvent('Base 2', '2023-01-01T12:00:00', '2023-01-01T13:00:00')
        ];

        // Task duration: 65 mins.
        // Gap 1: 60 mins (minus 1 min buffer before Base 2 starts -> 59 mins available).
        // 11:00 - 11:59.
        // Remaining: 65 - 59 = 6 mins.
        // Next gap starts at 13:01.
        // Remaining 6 mins < 10 mins. Should be discarded.
        const newTask = createEvent('New Long', '2023-01-01T11:00:00', '2023-01-01T12:05:00');

        const result = fillTheGapOfBaseTaskEvents(baseEvents, [newTask], 10);

        const newEvents = result.filter(t => t.title === 'New Long');
        expect(newEvents).toHaveLength(1);

        // Only the first part should exist
        expect(dayjs(newEvents[0].start).format('HH:mm')).toBe('11:00');
        expect(dayjs(newEvents[0].end).format('HH:mm')).toBe('11:59');
    });
});

describe('findDueTaskEvents', () => {
    const createEventWithId = (title: string, startStr: string, endStr: string, taskId: string, dueStr?: string): TaskEvent => {
        const start = dayjs(startStr).toDate();
        const end = dayjs(endStr).toDate();
        const event: TaskEvent = {
            title,
            start,
            end,
            task_id: taskId,
            backgroundColor: 'blue'
        };
        if (dueStr) {
            event.due = dayjs(dueStr).toDate();
        }
        return event;
    };

    it('should not mark events if max end date is before due date', () => {
        // Due: 12:00. End: 11:30. Safe.
        const events = [
            createEventWithId('Task 1', '2023-01-01T11:00:00', '2023-01-01T11:30:00', 't1', '2023-01-01T12:00:00')
        ];
        const result = findDueTaskEvents(events);
        expect(result[0].backgroundColor).toBe('blue');
        expect(result[0].delay).toBeUndefined();
    });

    it('should mark events as red if max end date is after due date', () => {
        // Due: 11:00. End: 11:30. Late by 30 mins (1800s).
        const events = [
            createEventWithId('Task 1', '2023-01-01T11:00:00', '2023-01-01T11:30:00', 't1', '2023-01-01T11:00:00')
        ];
        const result = findDueTaskEvents(events);
        expect(result[0].backgroundColor).toBe('red');
        expect(result[0].delay).toBe(1800);
    });

    it('should mark all events of the same task as red if the task finishes late', () => {
        // Task t1 split into two parts.
        // Part 1: 10:00 - 10:30 (Safe vs Due 12:00)
        // Part 2: 12:30 - 13:00 (Late vs Due 12:00)
        // All parts should be red.
        const due = '2023-01-01T12:00:00';
        const events = [
            createEventWithId('Task 1 Part 1', '2023-01-01T10:00:00', '2023-01-01T10:30:00', 't1', due),
            createEventWithId('Task 1 Part 2', '2023-01-01T12:30:00', '2023-01-01T13:00:00', 't1', due)
        ];

        const result = findDueTaskEvents(events);

        expect(result).toHaveLength(2);
        // Delay: 13:00 - 12:00 = 1 hour = 3600s
        expect(result[0].backgroundColor).toBe('red');
        expect(result[0].delay).toBe(3600);

        expect(result[1].backgroundColor).toBe('red');
        expect(result[1].delay).toBe(3600);
    });

    it('should handle tasks without due date', () => {
        const events = [
            createEventWithId('Task 1', '2023-01-01T11:00:00', '2023-01-01T11:30:00', 't1')
        ];
        const result = findDueTaskEvents(events);
        expect(result[0].backgroundColor).toBe('blue');
    });
});
