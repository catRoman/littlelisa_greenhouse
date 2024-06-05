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

  async updateGreenhouseInfo(lat, long, location, style, greenhouseId) {
    const query = `
      update greenhouses
      location = $1 and style=$2 and  lat = $3 and long = $4
      where greenhouseId = $5
      returning *
      `;
    const results = await this.query(query, [
      location,
      style,
      lat,
      long,
      greenhouseId,
    ]);
    return results[0] ? results[0] : null;
  }
}

export default new GreenHousesRepo();
