-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'controllers'::regclass AND contype = 'f';

-- begin;

-- alter table controllers drop constraint controllers_controller_id_fkey;

-- ALTER TABLE controllers
-- ADD CONSTRAINT fk_controllers_modules
-- FOREIGN KEY(controller_id)
-- REFERENCES modules(module_id)
-- ON DELETE CASCADE;

-- commit;

-- DO $$
-- DECLARE
--     rec RECORD;
-- BEGIN
--     FOR rec IN (
--         SELECT
--             tc.constraint_name,
--             tc.table_schema,
--             tc.table_name,
--             kcu.column_name,
--             ccu.table_name AS foreign_table_name,
--             ccu.column_name AS foreign_column_name
--         FROM
--             information_schema.table_constraints AS tc
--             JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
--             JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
--         WHERE
--             tc.constraint_type = 'FOREIGN KEY'
--             AND tc.table_schema = 'littlelisa_proto' -- Targeting your specific schema
--             AND NOT EXISTS (
--                 SELECT 1
--                 FROM information_schema.referential_constraints
--                 WHERE
--                     constraint_name = tc.constraint_name
--                     AND delete_rule = 'CASCADE'
--             )
--     ) LOOP
--         -- Dynamically execute SQL to drop and recreate the foreign key with ON DELETE CASCADE
--         EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I;', rec.table_schema, rec.table_name, rec.constraint_name);
--         EXECUTE format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I (%I) ON DELETE CASCADE;',
--                        rec.table_schema, rec.table_name, rec.constraint_name, rec.column_name, rec.table_schema, rec.foreign_table_name, rec.foreign_column_name);
--     END LOOP;
-- END $$;
-- ALTER TABLE enviroment_action_log.littlelisa_proto ADD CONSTRAINT fk_env_action_log_zone FOREIGN KEY (zone_id) REFERENCES zones.littlelisa_proto (zone_id) ON DELETE CASCADE;
-- NOTICE: ALTER TABLE debug_log.littlelisa_proto DROP CONSTRAINT fk_debug_log_module;
-- NOTICE: ALTER TABLE debug_log.littlelisa_proto DROP CONSTRAINT fk_debug_log_module;
-- NOTICE: ALTER TABLE enviroment_action_log.littlelisa_proto DROP CONSTRAINT fk_env_action_log_square;



---------------------------------------------------
--clear sensor/modules/controllers/nodes etc
-------------------------------------------------
-- delete from littlelisa_proto.sensors;
-- ALTER SEQUENCE sensors_sensor_id_seq RESTART WITH 1;

-- delete from littlelisa_proto.dht22_data;
-- ALTER SEQUENCE sensor_data_data_id_seq RESTART WITH 1;

-- delete from littlelisa_proto.modules;
-- ALTER SEQUENCE modules_module_id_seq RESTART WITH 1;

-- delete from littlelisa_proto.controllers;


-- delete from littlelisa_proto.nodes;

-- truncate table greenhouses cascade;


-- CREATE OR REPLACE FUNCTION point3d_in(cstring)
-- RETURNS point3d AS $$
-- DECLARE
--     x NUMERIC;
--     y NUMERIC;
--     z NUMERIC;
-- BEGIN
--     -- Parse input string (assuming format: '(x,y,z)')
--     x := split_part($1, ',', 1); -- Extract x from between parentheses
--     y := split_part($1, ',', 2);
--     z := split_part($1, ',', 3);

--     -- Validation (Optional - ensure values are numeric)
--     IF x::NUMERIC IS NULL OR y::NUMERIC IS NULL OR z::NUMERIC IS NULL THEN
--         RAISE EXCEPTION 'Invalid input for point3d: %', $1;
--     END IF;

--     -- Return the constructed point3d
--     RETURN (x::NUMERIC, y::NUMERIC, z::NUMERIC); -- Assuming (x,y,z) is how your type is constructed
-- END;
-- $$ LANGUAGE plpgsql IMMUTABLE STRICT;

-- alter table zones
-- add column height int;

-- -- Grant privileges to postgres
-- GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON zn_rel_pos TO postgres;

-- -- Grant privileges to little_lisa
-- GRANT SELECT, INSERT, UPDATE, DELETE ON zn_rel_pos TO little_lisa;
-- Grant privileges to postgres on the sequence
GRANT USAGE, SELECT ON SEQUENCE models_zn_rel_pos_model_zn_rel_pos_id_seq TO postgres;

-- Grant privileges to little_lisa on the sequence
GRANT USAGE ON SEQUENCE models_zn_rel_pos_model_zn_rel_pos_id_seq TO little_lisa;