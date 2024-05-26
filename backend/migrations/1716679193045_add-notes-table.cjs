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
    create table notes(
        note_id serial primary key,
        note text not null,
        greenhouse_id int,
        zone_id int,
        square_id int,
        created_at timestamp default current_timestamp,
        foreign key (greenhouse_id) references greenhouses(greenhouse_id) on delete cascade,
        foreign key (zone_id) references zones(zone_id) on delete cascade,
        foreign key(square_id) references squares(square_id) on delete cascade,
        check (
            greenhouse_id is not null or
            zone_id is not null or
            square_id is not null)
    );
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE notes DROP CONSTRAINT notes_greenhouse_id_fkey;
    ALTER TABLE notes DROP CONSTRAINT notes_zone_id_fkey;
    ALTER TABLE notes DROP CONSTRAINT notes_square_id_fkey;

    drop table notes;
    `);
};
