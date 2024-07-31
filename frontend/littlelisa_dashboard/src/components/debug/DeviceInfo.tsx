export default function DeviceInfo() {
  return (
    <ul>
      <li className="">
        <h3 className="">App Info</h3>
        <ul>
          <li>
            Project Name:<span className="">-</span>
          </li>
          <li>
            App Version:<span className="">-</span>
          </li>
          <li>
            Secure Version:<span className="">-</span>
          </li>
        </ul>
      </li>
      <li className="">
        <h3 className="">Chip Info</h3>
        <ul>
          <li>
            Num Cores:<span className="">-</span>
          </li>
          <li>
            Chip type:<span className="">-</span>
          </li>
        </ul>
      </li>
      <li className="">
        <h3 className="">Compile Info</h3>
        <ul>
          <li>
            Time:<span className="">-</span>
          </li>
          <li>
            Date:<span className="">-</span>
          </li>
          <li className="">
            Idf-version:<span className="">-</span>
          </li>
        </ul>
      </li>
    </ul>
  );
}
