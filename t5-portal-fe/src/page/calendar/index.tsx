import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import interactionPlugin from '@fullcalendar/interaction' // needed for dayClick
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import { useList } from "@refinedev/core";
import { Cron } from "interfaces";
import { convertCronToEvents } from "../../utility/cron";

export const CalendarPage = () => {
    const { query } = useList<Cron>({
        resource: "cron",
        pagination: {
            mode: "off"
        }
    });

    const cronJobs = query?.data?.data?.filter((cron) => cron.active) || [];

    return (
        <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
            headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
            }}
            initialView="timeGridDay"
            editable={true}
            events={(info, successCallback) => {
                const events = convertCronToEvents(cronJobs, info.start, info.end);
                successCallback(events);
            }}
        />
    )
}