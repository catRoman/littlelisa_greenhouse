-- -- Create initial 'Global' zone



CREATE OR REPLACE FUNCTION create_initial_zone_and_squares()
RETURNS TRIGGER AS $$
DECLARE
    new_zone_id INTEGER;
BEGIN
    -- Insert the "Global" zone
    INSERT INTO zones (
        greenhouse_id,
        zone_number,
        name,
        description,
        y_length,
        x_length,
        z_length,
        zone_start_point
    )
    VALUES (
        NEW.greenhouse_id,
        0,
        'Global Zone',
        'Global Zone - Generic entry for the entire greenhouse',
        NEW.y_length,
        NEW.x_length,
        NEW.z_length,
        '(1,1)'
    )
    RETURNING zone_id INTO new_zone_id; -- Store the new zone's ID

    -- Create squares for the "Global" zone
    FOR y_idx IN 1..NEW.y_length LOOP
        FOR x_idx IN 1..NEW.x_length LOOP
            INSERT INTO squares (zone_id, y_pos, x_pos)
            VALUES (new_zone_id, y_idx, x_idx);
        END LOOP;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -- Create a single trigger for both operations
-- CREATE TRIGGER create_initial_zone_and_squares_trigger
-- AFTER INSERT ON greenhouses
-- FOR EACH ROW
-- EXECUTE FUNCTION create_initial_zone_and_squares();

CREATE OR REPLACE FUNCTION update_square_zone_ids()
RETURNS TRIGGER AS $$

BEGIN

    -- Update zone_id for squares that fall within the new zone
    UPDATE squares sq
    SET zone_id = NEW.zone_id
    WHERE EXISTS (
        SELECT 1
        FROM zones z
        WHERE z.zone_id = NEW.zone_id
            AND (
                sq.x_pos >= zone_start_point[0] AND
                sq.x_pos < zone_start_point[0] + z.x_length AND
                sq.y_pos >= zone_start_point[1] AND
                sq.y_pos < zone_start_point[1] + z.y_length
            )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- CREATE TRIGGER update_squares_on_zone_insert
-- AFTER INSERT ON zones
-- FOR EACH ROW
-- EXECUTE FUNCTION update_square_zone_ids();