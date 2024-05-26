/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.sql(`
        create or replace function toggle_empty_square()
        returns trigger as $$
        begin
        if(
            new.plant_type is not null or
            new.date_planted is not null or
            new.date_expected_harvest is not null)
        then
        if
          new.is_empty <> false
        then
          new.is_empty := false;
        end if;
        else
          if
            new.is_empty <> true then
        new.is_empty := true;
        end if;
        end if;
        return new;
        end;
        $$ language plpgsql;

        create trigger toogle_is_empty_trigger before insert or update on squares for each row execute function toggle_empty_square();
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {};
