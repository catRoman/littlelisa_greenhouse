export default function Root() {
  return (
    <>
      <ul className="m-4 list-none space-y-4">
        <li>
          <a href={`/dashboard`}> DASHBOARD</a>
        </li>
        <li>
          <a href={`/sensors`}> SENSOR OVERVIEW</a>
        </li>
        <li>
          <a href={`/zones`}> ZONES</a>
        </li>
        <li>
          <a href={`/settings`}> SETTINGS</a>
        </li>
      </ul>
    </>
  );
}
