import BaseRepo from "./baseRepo.js";
import { EventType } from "../utility/enums.js";

class EventLogRepo extends BaseRepo {
  constructor() {
    super("event_log", "greenhouse");
  }

  async addEvent(
    eventType,
    eventAction,
    details,
    greenhouseId,
    zoneId,
    squareId,
    moduleId,
    sensorId,
    note_id
    ) {


    const query = `
        insert into event_log(type, action, details, greenhouse_id, zone_id, square_id, module_id, sensor_id, note_id)
        values($1, $2,$3,$4,$5,$6,$7,$8,$9) returning *`;
    const log = await this.query(query, [
        eventType,
        eventAction,
        details,
        greenhouseId,
        zoneId,
        squareId,
        moduleId,
        sensorId,
        note_id
    ]);

    log[0] = log[0];
    return log[0];
  }

}


export default new EventLogRepo();
