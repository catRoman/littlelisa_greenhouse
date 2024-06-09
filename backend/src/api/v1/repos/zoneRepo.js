import BaseRepo from "./baseRepo.js";
class ZonesRepo extends BaseRepo {
  constructor() {
    super("zones", "greenhouse");
  }
}

export default new ZonesRepo();
