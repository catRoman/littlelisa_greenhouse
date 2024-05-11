import ZoneInfo from "./sub_components/ZoneInfo";
import { greenhouse_data } from "../../data/static_info";
export default function SectionBody() {
  return (
    <div className="flex flex-col gap-3">
      {greenhouse_data.zones.map((zone, index) => {
        return (
          <div key={`zone_info_${index}`}>
            <ZoneInfo zone={zone} zoneId={index + 1} />
          </div>
        );
      })}
    </div>
  );
}
