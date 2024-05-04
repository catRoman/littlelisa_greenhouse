import ScheduleCalendar from "../components/scheduleCalender/ScheduleCalendar";

export default function Scheduling() {
  return (
    <div>
      <div className="pl-6">
        <h1 className="text-3xl">Schedule here</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta enim
          blanditiis, saepe esse vitae aliquid excepturi temporibus natus, porro
          vel eligendi explicabo sit illo sint odio. Dolorem aliquam earum
          dignissimos.
        </p>
      </div>
      <div className="p-16">
        <ScheduleCalendar />
      </div>
    </div>
  );
}
