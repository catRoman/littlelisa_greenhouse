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

  async updateSqaure(
    plantType,
    isTransplanted,
    datePlanted,
    dateHarvest,
    squareId
  ) {
    const query = await this.query(
      `update squares
      set
        plant_type = $1,
        s_transplanted = $2,
        date_planted = $3,
        date_expected_harvest = $4
      where square_id = $5
      returning *`,
      [plantType, isTransplanted, datePlanted, dateHarvest, squareId]
    );

    return query[0] ? query[0] : null;
  }
}

export default new SquareRepo();
