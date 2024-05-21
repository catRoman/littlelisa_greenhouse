import BaseRepo from "./baseRepo.js";
class GreenHousesRepo extends BaseRepo {
  constructor() {
    super("greenhouses", "user");
  }
}

export default new GreenHousesRepo();
