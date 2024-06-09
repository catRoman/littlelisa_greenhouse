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

    CREATE TYPE point3d AS (
        x integer,
        y integer,
        z integer
    );

    CREATE FUNCTION add_sensor_data(sensor_data jsonb) RETURNS void
        LANGUAGE plpgsql
        AS $$
    declare
        --jsonb data
        --greenhouse info
        gh_id int;
        z_id int;
        z_num int;
        --module info
        c_id varchar(25);
        m_type varchar(25);
        f_ver varchar(10);
        d_comp_str varchar(30);
        d_comp timestamp;
        id varchar(25);
        m_loc varchar(50);
        l_s_id int;
        m_pos_x int;
        m_pos_y int;
        m_zn_rel_pos_x int;
        m_zn_rel_pos_y int;
        m_zn_rel_pos_z int;
        --sensor info
        s_pin int;
        s_type varchar(25);
        s_ts_str varchar(30);
        s_ts timestamp;
        s_loc varchar(50);
        s_pos_x int;
        s_pos_y int;
        s_zn_rel_pos_x int;
        s_zn_rel_pos_y int;
        s_zn_rel_pos_z int;



        --helper variables
        mod_id int;
        con_id int;
        s_type_id int;
        s_id int;
        m_selected_square_id int;
        m_selected_zn_rel_pos_id int;
        s_selected_square_id int;
        s_selected_zn_rel_pos_id int;
        module_square_pos boolean;
        sensor_square_pos boolean;
    begin
        --extract data fron jsonb
        --greenhouse info
        gh_id := sensor_data->'greenhouse_info'->>'greenhouse_id';
        z_num  :=sensor_data->'greenhouse_info'->>'zone_num';
        --module info
        c_id  :=sensor_data->'module_info'->>'controller_identifier';
        f_ver  :=sensor_data->'module_info'->>'firmware_version';
        m_type :=sensor_data->'module_info'->>'type';
        d_comp_str  :=sensor_data->'module_info'->>'date_compilied';


            --adjsut timestamp for postgres str exp. "Apr 25 2024 01:12:09"
        d_comp  := to_timestamp(d_comp_str, 'Mon DD YYYY HH24:MI:SS');
        id  :=sensor_data->'module_info'->>'identifier';
        m_loc  :=sensor_data->'module_info'->>'location';
        --sensor info
        l_s_id  :=sensor_data->'sensor_info'->>'local_sensor_id';
        s_pin  :=sensor_data->'sensor_info'->>'sensor_pin';
        s_type  :=sensor_data->'sensor_info'->>'sensor_type';
        s_ts_str  :=sensor_data->'sensor_info'->>'timestamp';
            --adjsut timestamp for postgres str exp. 'Thu Apr 25 00:43:14 2024'
        s_ts := to_timestamp(s_ts_str, 'Dy Mon DD HH24:MI:SS YYYY');
        s_loc  :=sensor_data->'sensor_info'->>'location';

        ------------------------------------
        --check data
        --for moduel

        IF (sensor_data -> 'module_info' -> 'square_pos') ? 'x' THEN
            m_pos_x := (sensor_data -> 'module_info' -> 'square_pos') ->> 'x';
            m_pos_y := (sensor_data -> 'module_info' -> 'square_pos') ->> 'y';
                m_zn_rel_pos_x := NULL;
            m_zn_rel_pos_y := NULL;
            m_zn_rel_pos_z := NULL;
            module_square_pos := true;
        ELSE
            m_pos_x := NULL;
            m_pos_y := NULL;
            m_zn_rel_pos_x := (sensor_data -> 'module_info' -> 'zn_rel_pos') ->> 'x';
            m_zn_rel_pos_y := (sensor_data -> 'module_info' -> 'zn_rel_pos') ->> 'y';
            m_zn_rel_pos_z := (sensor_data -> 'module_info' -> 'zn_rel_pos') ->> 'z';
            module_square_pos := false;
        END IF;



        --for sensor
        IF (sensor_data -> 'sensor_info' -> 'square_pos') ? 'x' THEN
            s_pos_x := (sensor_data -> 'sensor_info' -> 'square_pos') ->> 'x';
            s_pos_y := (sensor_data -> 'sensor_info' -> 'square_pos') ->> 'y';
                    s_zn_rel_pos_x := NULL;
            s_zn_rel_pos_y := NULL;
            s_zn_rel_pos_z := NULL;
            sensor_square_pos := true;
        ELSE
            s_pos_x := NULL;
            s_pos_y := NULL;
            s_zn_rel_pos_x := (sensor_data -> 'sensor_info' -> 'zn_rel_pos') ->> 'x';
            s_zn_rel_pos_y := (sensor_data -> 'sensor_info' -> 'zn_rel_pos') ->> 'y';
            s_zn_rel_pos_z := (sensor_data -> 'sensor_info' -> 'zn_rel_pos') ->> 'z';
            sensor_square_pos := false;
        END IF;


      m_selected_square_id := null;
        m_selected_zn_rel_pos_id := null;
        s_selected_square_id := null;
        s_selected_zn_rel_pos_id := null;
        -------------------------------




        --check if greenhouse/zone exist throwe exception if not
        if not exists ( select 1 from greenhouses where greenhouses.greenhouse_id = gh_id)
        then raise exception 'Greenhouse % not found, rollingback data insert...', gh_id;
        end if;

        if not exists ( select 1 from zones where zone_number = z_num)
        then raise exception 'Zone % not found, rollingback data insert...', z_num;
        else
            SELECT zone_id INTO z_id FROM zones WHERE zone_number = z_num;
        end if;

    --get the square/zn_rel ids for module and sensor
        if module_square_pos is true
        then
            select square_id into m_selected_square_id from squares
            where x_pos = m_pos_x and y_pos = m_pos_y;
        else
            if not exists (
                select 1 from zn_rel_pos
                where
                    x_pos = m_zn_rel_pos_x and
                    y_pos = m_zn_rel_pos_y and
                    z_pos = m_zn_rel_pos_z
                    )
            then
                insert into zn_rel_pos(zone_id, x_pos, y_pos, z_pos)
                values (z_id, m_zn_rel_pos_x ,m_zn_rel_pos_y ,m_zn_rel_pos_z)
                returning zn_rel_pos_id into m_selected_zn_rel_pos_id;
            else
                SELECT zn_rel_pos_id INTO m_selected_zn_rel_pos_id  -- Use SELECT to get the existing ID
                FROM zn_rel_pos
                WHERE
                    x_pos = m_zn_rel_pos_x AND
                    y_pos = m_zn_rel_pos_y AND
                    z_pos = m_zn_rel_pos_z;

            end if;
        end if;

      if sensor_square_pos is true
        then
            select square_id into s_selected_square_id from squares
            where x_pos = s_pos_x and y_pos = s_pos_y;
        else
            if not exists (
                select 1 from zn_rel_pos
                where
                    x_pos = s_zn_rel_pos_x and
                    y_pos = s_zn_rel_pos_y and
                    z_pos = s_zn_rel_pos_z
                    )
            then
                insert into zn_rel_pos(zone_id, x_pos, y_pos, z_pos)
                values (z_id, s_zn_rel_pos_x ,s_zn_rel_pos_y ,s_zn_rel_pos_z)
                returning zn_rel_pos_id into s_selected_zn_rel_pos_id;
            else
                SELECT zn_rel_pos_id INTO s_selected_zn_rel_pos_id  -- Use SELECT to get the existing ID
                FROM zn_rel_pos
                WHERE
                    x_pos = s_zn_rel_pos_x AND
                    y_pos = s_zn_rel_pos_y AND
                    z_pos = s_zn_rel_pos_z;

            end if;
        end if;




        --check if module exist create/update
        if exists (
            select 1
            from modules
            where LOWER(identifier) = LOWER(id)
        )then
            -- module exists but  data needs updating
            update modules
            set
                greenhouse_id = gh_id,
                zone_id = z_id,
                firmware_version = f_ver,
                date_compilied = d_comp,
                location = m_loc,
                square_id = m_selected_square_id,
                zn_rel_pos_id = m_selected_zn_rel_pos_id
            where lower(identifier) = lower(id)
            and (
                greenhouse_id != gh_id or
                zone_id != z_id or
                firmware_version != f_ver or
                date_compilied != d_comp or
                location != m_loc
                );


        else
            -- module not found
            insert into modules (greenhouse_id, zone_id, identifier, firmware_version, date_compilied, location , square_id, zn_rel_pos_id)
            values (gh_id, z_id, id, f_ver, d_comp, m_loc, m_selected_square_id, m_selected_zn_rel_pos_id);

        end if;


        --get module_id of current module created/updated
        SELECT module_id INTO mod_id FROM modules WHERE identifier = id;

    --set the square/zn_rel position
        -- if module_square_pos
        --     then
        --         update modules set square_id = m_selected_square_id, zn_rel_pos_id = null
        --         where module_id = mod_id;
        --     else
        --         update modules set zn_rel_pos_id = m_selected_zn_rel_pos, square_id = null
        --         where module_id = mod_id;
        --     end if;
        --create/update node/controller table based on type
        if lower(m_type) = 'controller'
        then
            --check/update controllers table
            if not exists( select 1 from controllers where controller_id = mod_id)
            then
                --controller not in controller list/ adding row
                insert into controllers(controller_id)
                values(mod_id);
            end if;
        --create/update node list
        elsif lower(m_type) = 'node'
        then
            --check if node exists/ verify correct controller
             begin
                if not exists (
                    select 1
                    from nodes
                    join controllers on nodes.controller_id = controllers.controller_id
                    join modules on controllers.controller_id = modules.module_id -- Key change here
                    where nodes.node_id = mod_id
                    and modules.identifier = c_id)
                then
                --node doesnt exist, first verify that the controller id is valid then create
                --node in list
                    if not exists (
                        select 1
                        from controllers
                        join modules on controllers.controller_id = modules.module_id
                        where modules.identifier = c_id)
                    then
                        raise exception 'node-controller issue: controller with identifier % does not exist, rollling back...', c_id;
                    else
                        --get controller id for node table
                        begin
                            select controller_id into con_id
                            from controllers join modules on controllers.controller_id = modules.module_id
                            where modules.identifier = c_id;

                            --add the node to the list
                            insert into nodes (node_id, controller_id)
                            values (mod_id, con_id);

                        end;
                    end if;
                end if;

             end;
        else raise exception 'Module type: % -> invalid, rolling back....', m_type;
        end if;

        --create/update sensors based on sesnor_id
        --check if sensor type exists if not throw exception else store sensor_type_id
        select type_id into s_type_id from sensor_types where type_name = s_type;

        if s_type_id is null
        then raise exception 'Sensor type % not found, rollingback data insert...', s_type;
        end if;

        if exists (
            select 1
            from sensors
            where local_sensor_id = l_s_id
            and module_id = mod_id
            )
        then
            update sensors
            -- module exists but  data needs updating
            set
                sensor_pin = s_pin,
                location = s_loc,
                type_id = s_type_id,
                  square_id = s_selected_square_id,
                zn_rel_pos_id = s_selected_zn_rel_pos_id
            where local_sensor_id = l_s_id
            and module_id = mod_id
            returning sensor_id into s_id;

            if not found then  -- No rows updated, so perform the insert instead
                insert into sensors (module_id, local_sensor_id, sensor_pin, location, type_id, square_id, zn_rel_pos_id)
                values (mod_id, l_s_id, s_pin, s_loc, s_type_id, s_selected_square_id, s_selected_zn_rel_pos_id)
                RETURNING sensor_id into s_id;
            end if;

        else
            -- module not found
            insert into sensors (module_id, local_sensor_id, sensor_pin, location, type_id, square_id, zn_rel_pos_id)
            values (mod_id, l_s_id, s_pin, s_loc, s_type_id, s_selected_square_id, s_selected_zn_rel_pos_id)
            returning sensor_id into s_id;
        end if;

        --set the square/zn_rel position
        -- if sensor_square_pos
        --     then
        --         update sensors set square_id = s_selected_square_id, zn_rel_pos_id = null
        --         where sensor_id = s_id;
        --     else
        --         update sensors set zn_rel_pos_id = s_selected_zn_rel_pos, square_id = null
        --         where sensor_id = s_id;
        --     end if;
        --add sensor data to corresponding inherited sensor_data type based on type

        if s_type = 'DHT22'
        then
            insert into dht22_data (sensor_id, timestamp, temperature, humidity)
            values (
                s_id,
                s_ts,
                (sensor_data->'sensor_info'->'data'->>'temperature')::numeric(5,2),
                (sensor_data->'sensor_info'->'data'->>'humidity')::numeric(5,2));

        else raise exception 'Irregular sensor type not caught, rolling back...';
        end if;

        raise notice 'sensor data added at %', now();







    end;
    $$;



    CREATE FUNCTION create_initial_zone_and_squares() RETURNS trigger
        LANGUAGE plpgsql
        AS $$
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
    $$;




    CREATE FUNCTION update_square_zone_ids() RETURNS trigger
        LANGUAGE plpgsql
        AS $$

    BEGIN
       -- Reset squares within the changed zone back to the default zone (zone_id 1)
        UPDATE squares sq
        SET zone_id = 1  -- Assuming zone_id 1 is your default zone
        WHERE sq.zone_id = NEW.zone_id;
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
    $$;



    SET default_tablespace = '';

    SET default_table_access_method = heap;


    CREATE TABLE cameras (
        camera_id integer NOT NULL,
        zone_id integer NOT NULL,
        location character varying(255),
        description text,
        stream_url text
    );



    CREATE SEQUENCE cameras_camera_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;






    CREATE TABLE controllers (
        controller_id integer NOT NULL,
        additional_info text
    );




    CREATE TABLE debug_log (
        log_id integer NOT NULL,
        module_id integer NOT NULL,
        log_type character varying(255),
        log text,
        "timestamp" timestamp without time zone
    );



    CREATE TABLE sensor_data (
        data_id integer NOT NULL,
        sensor_id integer,
        "timestamp" timestamp without time zone
    );



    CREATE TABLE dht22_data (
        temperature numeric(5,2),
        humidity numeric(5,2)
    )
    INHERITS (sensor_data);



    CREATE TABLE enviroment_action_log (
        action_id integer NOT NULL,
        square_id integer,
        zone_id integer,
        greenhouse_id integer NOT NULL,
        action_type character varying(255),
        detail text,
        "timestamp" timestamp without time zone
    );



    CREATE SEQUENCE enviroment_action_log_action_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;



    CREATE TABLE enviroment_state (
        state_id integer NOT NULL,
        controller_id integer NOT NULL,
        last_update timestamp without time zone NOT NULL,
        light_state text NOT NULL,
        water_state text NOT NULL,
        fan_state text NOT NULL,
        other_state text
    );



    CREATE SEQUENCE enviroment_state_state_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;



    CREATE TABLE enviromental_control_schedule (
        schedule_id integer NOT NULL,
        controller_id integer NOT NULL,
        action_type character varying(255) NOT NULL,
        start_date date,
        end_date date,
        start_time timestamp without time zone NOT NULL,
        end_time timestamp without time zone NOT NULL,
        frequency text NOT NULL,
        detail text,
        is_active boolean
    );



    CREATE SEQUENCE enviromental_control_schedule_schedule_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;



    CREATE TABLE enviromental_log (
        log_id integer NOT NULL,
        greenhouse_id integer NOT NULL,
        date date NOT NULL,
        log text NOT NULL
    );



    CREATE SEQUENCE enviromental_log_log_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;



    CREATE SEQUENCE event_log_log_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;



    CREATE TABLE weather (
        weather_id integer NOT NULL,
        greenhouse_id integer NOT NULL,
        date date,
        temperature numeric,
        humidity numeric,
        precipatation numeric,
        windspeed numeric,
        other text
    );




    CREATE SEQUENCE external_weather_weather_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;



    CREATE TABLE fertilizing_log (
        fertilizing_id integer NOT NULL,
        square_id integer NOT NULL,
        "timestamp" timestamp without time zone,
        type character varying(255),
        amount numeric
    );


    CREATE SEQUENCE fertilizing_log_fertilizing_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;




    CREATE TABLE greenhouses (
        greenhouse_id integer NOT NULL,
        name character varying(255) NOT NULL,
        location text NOT NULL,
        owner_id integer NOT NULL,
        z_length integer NOT NULL,
        x_length integer NOT NULL,
        y_length integer NOT NULL,
        style character varying(100) NOT NULL,
        lat numeric(9,6) NOT NULL,
        long numeric(9,6) NOT NULL
    );



    CREATE SEQUENCE greenhouse_greenhouse_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;

    CREATE TABLE lighting_log (
        lighting_id integer NOT NULL,
        zone_id integer NOT NULL,
        "timestamp" timestamp without time zone,
        duration numeric
    );

   CREATE SEQUENCE lighting_log_lighting_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;



    CREATE TABLE zn_rel_pos (
        zn_rel_pos_id integer NOT NULL,
        zone_id integer NOT NULL,
        x_pos integer NOT NULL,
        y_pos integer NOT NULL,
        z_pos integer NOT NULL
    );

    CREATE SEQUENCE models_zn_rel_pos_model_zn_rel_pos_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;

    CREATE TABLE modules (
        module_id integer NOT NULL,
        greenhouse_id integer NOT NULL,
        zone_id integer,
        identifier character varying(25),
        firmware_version character varying(255),
        date_compilied timestamp without time zone,
        location text,
        square_id integer,
        zn_rel_pos_id integer,
        CONSTRAINT square_or_rel_pos_check CHECK ((((square_id IS NULL) AND (zn_rel_pos_id IS NOT NULL)) OR ((square_id IS NOT NULL) AND (zn_rel_pos_id IS NULL))))
    );

   CREATE SEQUENCE modules_module_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;

    CREATE TABLE nodes (
        node_id integer NOT NULL,
        controller_id integer NOT NULL,
        additional_info text
    );

    CREATE SEQUENCE sensor_data_data_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;


    CREATE TABLE sensor_types (
        type_id integer NOT NULL,
        type_name character varying(255),
        additional_info text
    );

    CREATE SEQUENCE sensor_types_type_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;

   CREATE TABLE sensors (
        sensor_id integer NOT NULL,
        module_id integer NOT NULL,
        sensor_pin integer NOT NULL,
        location character varying(255),
        type_id integer,
        local_sensor_id integer,
        square_id integer,
        zn_rel_pos_id integer,
        CONSTRAINT square_or_zn_rel_pos_check CHECK ((((square_id IS NULL) AND (zn_rel_pos_id IS NOT NULL)) OR ((square_id IS NOT NULL) AND (zn_rel_pos_id IS NULL))))
    );

    CREATE SEQUENCE sensors_sensor_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;

    CREATE TABLE squares (
        square_id integer NOT NULL,
        zone_id integer NOT NULL,
        y_pos integer NOT NULL,
        x_pos integer NOT NULL,
        plant_type character varying(255),
        date_planted date,
        date_expeceted_harvest date,
        notes text,
        is_transplant boolean DEFAULT false,
        is_empty boolean
    );

    CREATE SEQUENCE squares_square_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
   CREATE TABLE users (
        user_id integer NOT NULL,
        username character varying(255) NOT NULL,
        password text NOT NULL,
        email character varying(255) NOT NULL
    );

    CREATE SEQUENCE users_user_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;

   CREATE TABLE watering_log (
        watering_id integer NOT NULL,
        square_id integer NOT NULL,
        "timestamp" timestamp without time zone,
        amount numeric
    );
    CREATE SEQUENCE watering_log_watering_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;

    CREATE TABLE zones (
        zone_id integer NOT NULL,
        greenhouse_id integer NOT NULL,
        name character varying(255),
        description text NOT NULL,
        y_length integer NOT NULL,
        x_length integer NOT NULL,
        zone_start_point point NOT NULL,
        z_length integer,
        zone_number integer
    );

    CREATE SEQUENCE zones_zone_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;





    ALTER TABLE ONLY cameras ALTER COLUMN camera_id SET DEFAULT nextval('cameras_camera_id_seq'::regclass);



    ALTER TABLE ONLY debug_log ALTER COLUMN log_id SET DEFAULT nextval('event_log_log_id_seq'::regclass);



    ALTER TABLE ONLY dht22_data ALTER COLUMN data_id SET DEFAULT nextval('sensor_data_data_id_seq'::regclass);



    ALTER TABLE ONLY enviroment_action_log ALTER COLUMN action_id SET DEFAULT nextval('enviroment_action_log_action_id_seq'::regclass);



    ALTER TABLE ONLY enviroment_state ALTER COLUMN state_id SET DEFAULT nextval('enviroment_state_state_id_seq'::regclass);



    ALTER TABLE ONLY enviromental_control_schedule ALTER COLUMN schedule_id SET DEFAULT nextval('enviromental_control_schedule_schedule_id_seq'::regclass);



    ALTER TABLE ONLY enviromental_log ALTER COLUMN log_id SET DEFAULT nextval('enviromental_log_log_id_seq'::regclass);



    ALTER TABLE ONLY fertilizing_log ALTER COLUMN fertilizing_id SET DEFAULT nextval('fertilizing_log_fertilizing_id_seq'::regclass);



    ALTER TABLE ONLY greenhouses ALTER COLUMN greenhouse_id SET DEFAULT nextval('greenhouse_greenhouse_id_seq'::regclass);



    ALTER TABLE ONLY lighting_log ALTER COLUMN lighting_id SET DEFAULT nextval('lighting_log_lighting_id_seq'::regclass);



    ALTER TABLE ONLY modules ALTER COLUMN module_id SET DEFAULT nextval('modules_module_id_seq'::regclass);



    ALTER TABLE ONLY sensor_data ALTER COLUMN data_id SET DEFAULT nextval('sensor_data_data_id_seq'::regclass);



    ALTER TABLE ONLY sensor_types ALTER COLUMN type_id SET DEFAULT nextval('sensor_types_type_id_seq'::regclass);



    ALTER TABLE ONLY sensors ALTER COLUMN sensor_id SET DEFAULT nextval('sensors_sensor_id_seq'::regclass);



    ALTER TABLE ONLY squares ALTER COLUMN square_id SET DEFAULT nextval('squares_square_id_seq'::regclass);



    ALTER TABLE ONLY users ALTER COLUMN user_id SET DEFAULT nextval('users_user_id_seq'::regclass);



    ALTER TABLE ONLY watering_log ALTER COLUMN watering_id SET DEFAULT nextval('watering_log_watering_id_seq'::regclass);



    ALTER TABLE ONLY weather ALTER COLUMN weather_id SET DEFAULT nextval('external_weather_weather_id_seq'::regclass);



    ALTER TABLE ONLY zn_rel_pos ALTER COLUMN zn_rel_pos_id SET DEFAULT nextval('models_zn_rel_pos_model_zn_rel_pos_id_seq'::regclass);



    ALTER TABLE ONLY zones ALTER COLUMN zone_id SET DEFAULT nextval('zones_zone_id_seq'::regclass);



    ALTER TABLE ONLY cameras
        ADD CONSTRAINT cameras_pkey PRIMARY KEY (camera_id);



    ALTER TABLE ONLY controllers
        ADD CONSTRAINT controllers_pkey PRIMARY KEY (controller_id);



    ALTER TABLE ONLY enviroment_action_log
        ADD CONSTRAINT enviroment_action_log_pkey PRIMARY KEY (action_id);



    ALTER TABLE ONLY enviroment_state
        ADD CONSTRAINT enviroment_state_pkey PRIMARY KEY (state_id);



    ALTER TABLE ONLY enviromental_control_schedule
        ADD CONSTRAINT enviromental_control_schedule_pkey PRIMARY KEY (schedule_id);



    ALTER TABLE ONLY enviromental_log
        ADD CONSTRAINT enviromental_log_pkey PRIMARY KEY (log_id);



    ALTER TABLE ONLY debug_log
        ADD CONSTRAINT event_log_pkey PRIMARY KEY (log_id);



    ALTER TABLE ONLY weather
        ADD CONSTRAINT external_weather_pkey PRIMARY KEY (weather_id);



    ALTER TABLE ONLY fertilizing_log
        ADD CONSTRAINT fertilizing_log_pkey PRIMARY KEY (fertilizing_id);




    ALTER TABLE ONLY greenhouses
        ADD CONSTRAINT greenhouse_pkey PRIMARY KEY (greenhouse_id);




    ALTER TABLE ONLY lighting_log
        ADD CONSTRAINT lighting_log_pkey PRIMARY KEY (lighting_id);




    ALTER TABLE ONLY zn_rel_pos
        ADD CONSTRAINT models_zn_rel_pos_pkey PRIMARY KEY (zn_rel_pos_id);



    ALTER TABLE ONLY modules
        ADD CONSTRAINT modules_pkey PRIMARY KEY (module_id);




    ALTER TABLE ONLY nodes
        ADD CONSTRAINT nodes_pkey PRIMARY KEY (node_id);



    ALTER TABLE ONLY sensor_data
        ADD CONSTRAINT sensor_data_pkey PRIMARY KEY (data_id);



    ALTER TABLE ONLY sensor_types
        ADD CONSTRAINT sensor_types_pkey PRIMARY KEY (type_id);



    ALTER TABLE ONLY sensors
        ADD CONSTRAINT sensors_pkey PRIMARY KEY (sensor_id);




    ALTER TABLE ONLY squares
        ADD CONSTRAINT squares_pkey PRIMARY KEY (square_id);


    ALTER TABLE ONLY users
        ADD CONSTRAINT users_email_key UNIQUE (email);



    ALTER TABLE ONLY users
        ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);




    ALTER TABLE ONLY users
        ADD CONSTRAINT users_username_key UNIQUE (username);



    ALTER TABLE ONLY watering_log
        ADD CONSTRAINT watering_log_pkey PRIMARY KEY (watering_id);



    ALTER TABLE ONLY zones
        ADD CONSTRAINT zones_pkey PRIMARY KEY (zone_id);




    CREATE TRIGGER create_initial_zone_and_squares_trigger AFTER INSERT ON greenhouses FOR EACH ROW EXECUTE FUNCTION create_initial_zone_and_squares();




    CREATE TRIGGER update_squares_on_zone_change AFTER INSERT OR UPDATE OF zone_start_point, x_length, y_length ON zones FOR EACH ROW EXECUTE FUNCTION update_square_zone_ids();



    CREATE TRIGGER update_squares_on_zone_insert AFTER INSERT ON zones FOR EACH ROW EXECUTE FUNCTION update_square_zone_ids();




    ALTER TABLE ONLY cameras
        ADD CONSTRAINT fk_cameras_zones FOREIGN KEY (zone_id) REFERENCES zones(zone_id) ON DELETE CASCADE;




    ALTER TABLE ONLY controllers
        ADD CONSTRAINT fk_controllers_modules FOREIGN KEY (controller_id) REFERENCES modules(module_id) ON DELETE CASCADE;




    ALTER TABLE ONLY debug_log
        ADD CONSTRAINT fk_debug_log_module FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE CASCADE;



    ALTER TABLE ONLY enviroment_action_log
        ADD CONSTRAINT fk_env_action_log_square FOREIGN KEY (square_id) REFERENCES squares(square_id) ON DELETE CASCADE;



    ALTER TABLE ONLY enviroment_action_log
        ADD CONSTRAINT fk_env_action_log_zone FOREIGN KEY (zone_id) REFERENCES zones(zone_id) ON DELETE CASCADE;


    ALTER TABLE ONLY enviromental_control_schedule
        ADD CONSTRAINT fk_env_cntrl_scheld_module FOREIGN KEY (controller_id) REFERENCES modules(module_id) ON DELETE CASCADE;




    ALTER TABLE ONLY enviromental_log
        ADD CONSTRAINT fk_env_log_greenhouses FOREIGN KEY (greenhouse_id) REFERENCES greenhouses(greenhouse_id) ON DELETE CASCADE;




    ALTER TABLE ONLY enviroment_state
        ADD CONSTRAINT fk_env_state_module FOREIGN KEY (controller_id) REFERENCES modules(module_id) ON DELETE CASCADE;




    ALTER TABLE ONLY fertilizing_log
        ADD CONSTRAINT fk_fert_log_square FOREIGN KEY (square_id) REFERENCES squares(square_id) ON DELETE CASCADE;



    ALTER TABLE ONLY greenhouses
        ADD CONSTRAINT fk_greenhouse_users FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE;




    ALTER TABLE ONLY lighting_log
        ADD CONSTRAINT fk_lighting_logs_zones FOREIGN KEY (zone_id) REFERENCES zones(zone_id) ON DELETE CASCADE;




    ALTER TABLE ONLY modules
        ADD CONSTRAINT fk_module_greenhouse FOREIGN KEY (greenhouse_id) REFERENCES greenhouses(greenhouse_id) ON DELETE CASCADE;




    ALTER TABLE ONLY modules
        ADD CONSTRAINT fk_module_zones FOREIGN KEY (zone_id) REFERENCES zones(zone_id) ON DELETE CASCADE;




    ALTER TABLE ONLY modules
        ADD CONSTRAINT fk_modules_square FOREIGN KEY (square_id) REFERENCES squares(square_id);




    ALTER TABLE ONLY modules
        ADD CONSTRAINT fk_modules_zn_rel_pos FOREIGN KEY (zn_rel_pos_id) REFERENCES zn_rel_pos(zn_rel_pos_id);




    ALTER TABLE ONLY sensors
        ADD CONSTRAINT fk_sensor_square FOREIGN KEY (square_id) REFERENCES squares(square_id);




    ALTER TABLE ONLY sensors
        ADD CONSTRAINT fk_sensors_modules FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE CASCADE;




    ALTER TABLE ONLY sensors
        ADD CONSTRAINT fk_sensors_sensor_types FOREIGN KEY (type_id) REFERENCES sensor_types(type_id) ON DELETE CASCADE;




    ALTER TABLE ONLY sensors
        ADD CONSTRAINT fk_sensors_zn_rel_pos FOREIGN KEY (zn_rel_pos_id) REFERENCES zn_rel_pos(zn_rel_pos_id);




    ALTER TABLE ONLY squares
        ADD CONSTRAINT fk_squares_zones FOREIGN KEY (zone_id) REFERENCES zones(zone_id) ON DELETE CASCADE;




    ALTER TABLE ONLY watering_log
        ADD CONSTRAINT fk_watering_log_squares FOREIGN KEY (square_id) REFERENCES squares(square_id) ON DELETE CASCADE;




    ALTER TABLE ONLY weather
        ADD CONSTRAINT fk_weather_greenhouse FOREIGN KEY (greenhouse_id) REFERENCES greenhouses(greenhouse_id) ON DELETE CASCADE;



    ALTER TABLE ONLY zones
        ADD CONSTRAINT fk_zones_greenhouses FOREIGN KEY (greenhouse_id) REFERENCES greenhouses(greenhouse_id) ON DELETE CASCADE;



    ALTER TABLE ONLY zn_rel_pos
        ADD CONSTRAINT models_zn_rel_pos_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES zones(zone_id) ON DELETE CASCADE;



    ALTER TABLE ONLY nodes
        ADD CONSTRAINT nodes_controller_id_fkey FOREIGN KEY (controller_id) REFERENCES controllers(controller_id) ON DELETE CASCADE;




    ALTER TABLE ONLY nodes
        ADD CONSTRAINT nodes_node_id_fkey FOREIGN KEY (node_id) REFERENCES modules(module_id) ON DELETE CASCADE;




    ALTER TABLE ONLY sensor_data
        ADD CONSTRAINT sensor_data_sensor_id_fkey FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id) ON DELETE CASCADE;






    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql(`
    drop schema public cascade;
create schema public;
grant on all schema public TO public;
grant on all schema public TO little_lisa;`);
};
