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
    insert into users (username, password, email)
    values('catRoman', 'password', 'catlinroman84@gmail.com');

    insert into greenhouses(name,location,owner_id,z_length,x_length,y_length, style, lat, long)
    values ('proto', 'front yard', 1,6,12,16,'half tunnel',48.420,-123.53);

    insert into zones(greenhouse_id, name, description, y_length,x_length, zone_start_point, z_length, zone_number)
    values
    (1, 'zone 1', 'test zone for node 1', 6,3,'(1,1)',2,1),
    (1,'zone 2', 'test zone for node 2', 6,4,'(1,7)',3,2);
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql(`
  delete from squares;
  alter sequence squares_square_id_seq restart with 1;

  delete from zones
    where greenhouse_id = 1 AND name IN ('zone 1', 'zone 2');
    alter sequence zones_zone_id_seq restart with 1;

    delete from greenhouses
    where name = 'proto' AND location = 'front yard' AND owner_id = 1;
    alter sequence greenhouse_greenhouse_id_seq restart with 1;

    delete from users
    where username = 'catRoman' AND email = 'catlinroman84@gmail.com';
    alter sequence users_user_id_seq restart with 1;


    `);
};
