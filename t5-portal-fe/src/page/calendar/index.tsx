import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import interactionPlugin from '@fullcalendar/interaction' // needed for dayClick
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import rrulePlugin from '@fullcalendar/rrule'
import { useList } from "@refinedev/core";
import { Task } from "../../interfaces";
import { findDueTaskEvents } from "../../utility/task_schedule";
import { convertTaskToEvent } from "../../utility/task_schedule";

export const CalendarPage = () => {
    const { query } = useList<Task>({
        resource: "tasks",
        pagination: {
            mode: "off"
        }
    });

    const tasks = query?.data?.data || [];
    const taskEvents = convertTaskToEvent(tasks)

    return (
        <div>
            <p>Total Delay: {findDueTaskEvents(taskEvents).reduce((acc, event) => acc + (event.delay || 0), 0) / 60}m</p>
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
                slotDuration={"00:10:00"}
                slotEventOverlap={false}
                nowIndicator
            />
        </div>
    )
}