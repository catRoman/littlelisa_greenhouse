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
}

export default new SquareRepo();
