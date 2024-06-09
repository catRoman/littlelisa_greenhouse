import CurrentMonthCalendar from "../components/scheduleCalender/CurrentMonthCalendar";

export default function CalenderPage() {
  return (
    <div>
      <div className="pl-6">
        <h1 className="text-3xl">Calender here</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta enim
          blanditiis, saepe esse vitae aliquid excepturi temporibus natus, porro
          vel eligendi explicabo sit illo sint odio. Dolorem aliquam earum
          dignissimos.
        </p>
      </div>

      <div className="grid grid-cols-4">
        <div className="col-span-2 row-span-2 p-16">
          <CurrentMonthCalendar />
        </div>
      </div>
    </div>
  );
}
