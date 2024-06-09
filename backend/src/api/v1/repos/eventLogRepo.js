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


  async getAllByParentId(parentNameId, parentId, greenhouseId) {
    const idType = parentNameId.slice(0, -1);

    const query = `
    SELECT * FROM event_log
    WHERE ${idType}_id = $1 and greenhouse_id = $2 order by created_at desc`;
    const logs = await this.query(query, [parentId, greenhouseId]);

    return logs ? logs : null;
  }
}
export default new EventLogRepo();
