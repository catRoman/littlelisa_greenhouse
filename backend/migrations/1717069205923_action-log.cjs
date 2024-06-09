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
    create table event_log(
        event_id serial primary key,
        type varchar(25) not null,
        action varchar(25) not null,
        details text ,
        created_at timestamp default current_timestamp,
        greenhouse_id int references greenhouses(greenhouse_id) not null,
        zone_id int references zones(zone_id),
        square_id int references squares(square_id),
        module_id int references modules(module_id),
        sensor_id int references sensors(sensor_id),
        note_id int references notes(note_id)
    )
    `)
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.sql(`drop table event_log`)
};
