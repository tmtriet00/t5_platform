import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import interactionPlugin from '@fullcalendar/interaction' // needed for dayClick
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import rrulePlugin from '@fullcalendar/rrule'
import { useList } from "@refinedev/core";
import { Task } from "../../interfaces";
import { rrulestr } from 'rrule';
import { convertTaskToEvent } from "../../utility/task_schedule";

export const CalendarPage = () => {
    const { query } = useList<Task>({
        resource: "tasks",
        pagination: {
            mode: "off"
        }
    });

    const tasks = query?.data?.data || [];

    const getEventColor = (status?: string) => {
        switch (status) {
            case 'completed': return 'green';
            case 'in_progress': return '#1890ff'; // processing
            case 'new': return 'blue';
            case 'blocked': return 'red';
            default: return 'gray';
        }
    };

    const taskEvents = convertTaskToEvent(tasks)

    console.log("taskEvents", taskEvents)

    const events = tasks.map((task) => {
        let duration = undefined;
        if (task.remaining_time) {
            // remaining_time is in seconds
            duration = task.remaining_time * 1000;
        }

        const baseEvent = {
            id: task.id.toString(),
            title: task.name,
            backgroundColor: getEventColor(task.status),
            borderColor: getEventColor(task.status),
        };

        if (task.rrule) {
            try {
                // Parse rrule string to get options, but use the plugin's object format
                const rule = rrulestr(task.rrule);
                const rruleOptions = rule.origOptions;

                return {
                    ...baseEvent,
                    rrule: {
                        ...rruleOptions,
                        dtstart: task.start_time || undefined, // dtstart is crucial for rrule
                    },
                    duration: duration,
                };
            } catch (e) {
                console.error("Failed to parse rrule for task", task.id, e);
                // Fallback to simple event if parsing fails
            }
        }

        return {
            ...baseEvent,
            start: task.start_time || undefined,
            end: task.due_time || undefined, // If due_time is null, it might be an all-day or point event? 
            // If we have duration from remaining_time but no due_time, we *could* use it,
            // but for non-recurring events, 'end' is usually explicit. 
            // If end is missing, FullCalendar uses default duration.
            // Let's use duration if due_time is missing?
            // Actually, if due_time is present, use it.
            // If not, and we have duration, use it? - Not standard prop for simple event, but 'duration' implies length.
            // For simple events, 'end' is preferred.
        };
    });

    return (
        <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin, rrulePlugin]}
            headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
            }}
            initialView="timeGridDay"
            editable={true}
            events={taskEvents}
        />
    )
}