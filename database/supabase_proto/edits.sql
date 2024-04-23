INSERT INTO greenhouses (name, location, owner_id, height, width, depth, style, lat, long)
VALUES ('proto','front yard', 1, 6, 12, 16, 'half tunnel',  48.42,-123.53);

--ALTER TABLE greenhouses
--ALTER COLUMN long TYPE DECIMAL(9,6);

--INSERT INTO users (username, password, email)
--VALUES ('littleLisa','$2a$12$jo0OCgYH.fGyrQZwxc5couea1G4Pj40t6uMNg3y3rwnrVroQtkym.', 'catlinroman84@gmail.com');

INSERT INTO zones (name, description, length, width)
VALUES ('Global', 'generic entry for the entire greenhouse', 16, 12);

UPDATE modules
SET module_id = 1
WHERE greenhouse_id = 1;

ALTER TABLE modules
ALTER COLUMN date_compilied TYPE TIMESTAMP;

INSERT INTO modules(type, identifier, firmware_version, date_compilied, location, greenhouse_id, zone_id)
VALUES ('controller', 'd4:8a:fc:d0:50:41','0.1.','2024-04-18 05:30:09','harage', 1, 1);

INSERT INTO 