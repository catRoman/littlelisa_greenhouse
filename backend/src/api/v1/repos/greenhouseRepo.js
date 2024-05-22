import BaseRepo from "./baseRepo.js";
import fs from "fs/promises";

class GreenHousesRepo extends BaseRepo {
  constructor() {
    super("greenhouses", "user");
  }

  async getTotalZones(greenhouseId) {
    const query = `
      Select count(*) as zones
        from zones
      where greenhouse_id = $1`;
    const results = await this.query(query, [greenhouseId]);
    results[0].zones = Number(results[0].zones);
    return results[0];
  }
  async getTotalControllers(greenhouseId) {
    const query = `
      select count(module_id) as controllers from modules
      join controllers c
      on
        c.controller_id = module_id
      where greenhouse_id = $1`;
    const results = await this.query(query, [greenhouseId]);
    results[0].controllers = Number(results[0].controllers);
    return results[0];
  }
  async getTotalNodes(greenhouseId) {
    const query = `
    select count(module_id) as nodes
      from modules
    join nodes n
      on n.node_id = module_id
    where greenhouse_id = $1;`;
    const results = await this.query(query, [greenhouseId]);
    results[0].nodes = Number(results[0].nodes);
    return results[0];
  }
  async getTotalSensors(greenhouseId) {
    const query = `
    select count(s.module_id) as sensors
      from sensors s
    join modules m
      on m.module_id = s.module_id
    where m.greenhouse_id = $1;`;
    const results = await this.query(query, [greenhouseId]);
    results[0].sensors = Number(results[0].sensors);
    return results[0];
  }
}

export default new GreenHousesRepo();
