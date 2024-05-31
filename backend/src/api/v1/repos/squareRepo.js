import BaseRepo from "./baseRepo.js";
class SquareRepo extends BaseRepo {
  constructor() {
    super("squares", "zone");
  }
  async getAllGreenhouseSquares(greenhouseId) {
    const query = await this.query(
      `
        select
            s.square_id as square_db_id,
            s.zone_id,
            z.zone_number,
            s.y_pos as row,
            s.x_pos as col,
            s.plant_type,
            s.date_planted,
            s.date_expected_harvest,
            s.is_transplant,
            s.is_empty

        from squares s
        join zones z
            on s.zone_id = z.zone_id
        where z.greenhouse_id = $1`,
      [greenhouseId]
    );

    return query;
  }

  async updateById(
    plantType,
    isTransplanted,
    datePlanted,
    dateHarvest,
    squareId
  ) {
    console.log("query time");
    const query = await this.query(
      `update squares
      set
        plant_type = $1,
        is_transplant = $2,
        date_planted = $3,
        date_expected_harvest = $4
      where square_id = $5
      returning *`,
      [plantType, isTransplanted, datePlanted, dateHarvest, squareId]
    );

    return query[0] ? query[0] : null;
  }

  async emptyZone(zoneId) {
    const query = await this.query(
      `update squares s
      set
        plant_type = null,
        is_transplant = false,
        date_planted = null,
        date_expected_harvest = null
        where s.zone_id = $1
      returning *`,
      [zoneId]
    );

    return query ? query : null;
  }

  async emptyGreenhouse(greenhouseId) {
    console.log("query time");
    const query = await this.query(
      `update squares s
      set
        plant_type = null,
        is_transplant = false,
        date_planted = null,
        date_expected_harvest = null
      from zones z
      where s.zone_id = z.zone_id
      and z.greenhouse_id = $1
      returning *`,
      [greenhouseId]
    );

    return query ? query : null;
  }
}

export default new SquareRepo();
