import Calendar from "react-calendar";

export default function DashSchedule() {
  return (
    <div className="flex justify-around px-4 pt-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-nowrap text-xl font-bold">Schedule Action</h3>
        <ul className="pl-0">
          <li>Upcoming Action &rarr; 4:24</li>
          <li>Upcoming Action &rarr; 4:34</li>
          <li>Upcoming Action &rarr; 5:04</li>
          <li>Upcoming Action &rarr; 6:24</li>
          <li>Upcoming Action &rarr; 2:24</li>
          <li>Upcoming Action &rarr; 4:24</li>
        </ul>
      </div>
      <div className="w-48 py-0">
        <Calendar />
      </div>
    </div>
  );
}
