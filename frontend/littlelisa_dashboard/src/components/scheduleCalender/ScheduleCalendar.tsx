import React, { useState } from "react";
import FullCalendar, { typ } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

interface Event {
  title: string;
  start: Date;
  allDay?: boolean;
}

const ScheduleCalendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  const handleDateClick = (arg) => {
    const title = prompt("Enter event title:");
    if (title) {
      const newEvent = {
        title,
        start: arg.date,
        allDay: arg.allDay,
      };
      setEvents([...events, newEvent]);
      // Send newEvent data to your backend here
    }
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      editable={true}
      selectable={true}
      selectMirror={true}
      dayMaxEvents={true}
      weekends={true}
      events={events}
      dateClick={handleDateClick}
    />
  );
};

export default ScheduleCalendar;
