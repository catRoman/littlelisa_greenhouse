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
    CREATE OR REPLACE FUNCTION set_zone_id()
    RETURNS TRIGGER AS $$
    BEGIN

    IF NEW.square_id IS NULL THEN
        RETURN NEW;
    END IF;


    SELECT zone_id INTO NEW.zone_id
    FROM squares
    WHERE square_id = NEW.square_id;


    IF NOT FOUND THEN
        RAISE EXCEPTION 'sqrId % not found in squares table', NEW.sqrId;
    END IF;

    RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    `)
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.sql(`
    drop function set_zone_id()
    `)
};
