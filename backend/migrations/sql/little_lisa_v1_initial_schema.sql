--
-- PostgreSQL database dump
--

-- Dumped from database version 15.6
-- Dumped by pg_dump version 15.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: littlelisa_proto; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA littlelisa_proto;


ALTER SCHEMA littlelisa_proto OWNER TO postgres;

--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA littlelisa_proto;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: point3d; Type: TYPE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TYPE littlelisa_proto.point3d AS (
	x integer,
	y integer,
	z integer
);


ALTER TYPE littlelisa_proto.point3d OWNER TO postgres;

--
-- Name: add_sensor_data(jsonb); Type: FUNCTION; Schema: littlelisa_proto; Owner: postgres
--

CREATE FUNCTION littlelisa_proto.add_sensor_data(sensor_data jsonb) RETURNS void
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


ALTER FUNCTION littlelisa_proto.add_sensor_data(sensor_data jsonb) OWNER TO postgres;

--
-- Name: create_initial_zone_and_squares(); Type: FUNCTION; Schema: littlelisa_proto; Owner: postgres
--

CREATE FUNCTION littlelisa_proto.create_initial_zone_and_squares() RETURNS trigger
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


ALTER FUNCTION littlelisa_proto.create_initial_zone_and_squares() OWNER TO postgres;

--
-- Name: update_square_zone_ids(); Type: FUNCTION; Schema: littlelisa_proto; Owner: postgres
--

CREATE FUNCTION littlelisa_proto.update_square_zone_ids() RETURNS trigger
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


ALTER FUNCTION littlelisa_proto.update_square_zone_ids() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cameras; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.cameras (
    camera_id integer NOT NULL,
    zone_id integer NOT NULL,
    location character varying(255),
    description text,
    stream_url text
);


ALTER TABLE littlelisa_proto.cameras OWNER TO postgres;

--
-- Name: cameras_camera_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.cameras_camera_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.cameras_camera_id_seq OWNER TO postgres;

--
-- Name: cameras_camera_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.cameras_camera_id_seq OWNED BY littlelisa_proto.cameras.camera_id;


--
-- Name: controllers; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.controllers (
    controller_id integer NOT NULL,
    additional_info text
);


ALTER TABLE littlelisa_proto.controllers OWNER TO postgres;

--
-- Name: debug_log; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.debug_log (
    log_id integer NOT NULL,
    module_id integer NOT NULL,
    log_type character varying(255),
    log text,
    "timestamp" timestamp without time zone
);


ALTER TABLE littlelisa_proto.debug_log OWNER TO postgres;

--
-- Name: sensor_data; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.sensor_data (
    data_id integer NOT NULL,
    sensor_id integer,
    "timestamp" timestamp without time zone
);


ALTER TABLE littlelisa_proto.sensor_data OWNER TO postgres;

--
-- Name: dht22_data; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.dht22_data (
    temperature numeric(5,2),
    humidity numeric(5,2)
)
INHERITS (littlelisa_proto.sensor_data);


ALTER TABLE littlelisa_proto.dht22_data OWNER TO postgres;

--
-- Name: enviroment_action_log; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.enviroment_action_log (
    action_id integer NOT NULL,
    square_id integer,
    zone_id integer,
    greenhouse_id integer NOT NULL,
    action_type character varying(255),
    detail text,
    "timestamp" timestamp without time zone
);


ALTER TABLE littlelisa_proto.enviroment_action_log OWNER TO postgres;

--
-- Name: enviroment_action_log_action_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.enviroment_action_log_action_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.enviroment_action_log_action_id_seq OWNER TO postgres;

--
-- Name: enviroment_action_log_action_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.enviroment_action_log_action_id_seq OWNED BY littlelisa_proto.enviroment_action_log.action_id;


--
-- Name: enviroment_state; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.enviroment_state (
    state_id integer NOT NULL,
    controller_id integer NOT NULL,
    last_update timestamp without time zone NOT NULL,
    light_state text NOT NULL,
    water_state text NOT NULL,
    fan_state text NOT NULL,
    other_state text
);


ALTER TABLE littlelisa_proto.enviroment_state OWNER TO postgres;

--
-- Name: enviroment_state_state_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.enviroment_state_state_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.enviroment_state_state_id_seq OWNER TO postgres;

--
-- Name: enviroment_state_state_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.enviroment_state_state_id_seq OWNED BY littlelisa_proto.enviroment_state.state_id;


--
-- Name: enviromental_control_schedule; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.enviromental_control_schedule (
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


ALTER TABLE littlelisa_proto.enviromental_control_schedule OWNER TO postgres;

--
-- Name: enviromental_control_schedule_schedule_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.enviromental_control_schedule_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.enviromental_control_schedule_schedule_id_seq OWNER TO postgres;

--
-- Name: enviromental_control_schedule_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.enviromental_control_schedule_schedule_id_seq OWNED BY littlelisa_proto.enviromental_control_schedule.schedule_id;


--
-- Name: enviromental_log; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.enviromental_log (
    log_id integer NOT NULL,
    greenhouse_id integer NOT NULL,
    date date NOT NULL,
    log text NOT NULL
);


ALTER TABLE littlelisa_proto.enviromental_log OWNER TO postgres;

--
-- Name: enviromental_log_log_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.enviromental_log_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.enviromental_log_log_id_seq OWNER TO postgres;

--
-- Name: enviromental_log_log_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.enviromental_log_log_id_seq OWNED BY littlelisa_proto.enviromental_log.log_id;


--
-- Name: event_log_log_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.event_log_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.event_log_log_id_seq OWNER TO postgres;

--
-- Name: event_log_log_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.event_log_log_id_seq OWNED BY littlelisa_proto.debug_log.log_id;


--
-- Name: weather; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.weather (
    weather_id integer NOT NULL,
    greenhouse_id integer NOT NULL,
    date date,
    temperature numeric,
    humidity numeric,
    precipatation numeric,
    windspeed numeric,
    other text
);


ALTER TABLE littlelisa_proto.weather OWNER TO postgres;

--
-- Name: external_weather_weather_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.external_weather_weather_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.external_weather_weather_id_seq OWNER TO postgres;

--
-- Name: external_weather_weather_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.external_weather_weather_id_seq OWNED BY littlelisa_proto.weather.weather_id;


--
-- Name: fertilizing_log; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.fertilizing_log (
    fertilizing_id integer NOT NULL,
    square_id integer NOT NULL,
    "timestamp" timestamp without time zone,
    type character varying(255),
    amount numeric
);


ALTER TABLE littlelisa_proto.fertilizing_log OWNER TO postgres;

--
-- Name: fertilizing_log_fertilizing_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.fertilizing_log_fertilizing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.fertilizing_log_fertilizing_id_seq OWNER TO postgres;

--
-- Name: fertilizing_log_fertilizing_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.fertilizing_log_fertilizing_id_seq OWNED BY littlelisa_proto.fertilizing_log.fertilizing_id;


--
-- Name: greenhouses; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.greenhouses (
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


ALTER TABLE littlelisa_proto.greenhouses OWNER TO postgres;

--
-- Name: greenhouse_greenhouse_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.greenhouse_greenhouse_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.greenhouse_greenhouse_id_seq OWNER TO postgres;

--
-- Name: greenhouse_greenhouse_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.greenhouse_greenhouse_id_seq OWNED BY littlelisa_proto.greenhouses.greenhouse_id;


--
-- Name: lighting_log; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.lighting_log (
    lighting_id integer NOT NULL,
    zone_id integer NOT NULL,
    "timestamp" timestamp without time zone,
    duration numeric
);


ALTER TABLE littlelisa_proto.lighting_log OWNER TO postgres;

--
-- Name: lighting_log_lighting_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.lighting_log_lighting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.lighting_log_lighting_id_seq OWNER TO postgres;

--
-- Name: lighting_log_lighting_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.lighting_log_lighting_id_seq OWNED BY littlelisa_proto.lighting_log.lighting_id;


--
-- Name: zn_rel_pos; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.zn_rel_pos (
    zn_rel_pos_id integer NOT NULL,
    zone_id integer NOT NULL,
    x_pos integer NOT NULL,
    y_pos integer NOT NULL,
    z_pos integer NOT NULL
);


ALTER TABLE littlelisa_proto.zn_rel_pos OWNER TO postgres;

--
-- Name: models_zn_rel_pos_model_zn_rel_pos_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.models_zn_rel_pos_model_zn_rel_pos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.models_zn_rel_pos_model_zn_rel_pos_id_seq OWNER TO postgres;

--
-- Name: models_zn_rel_pos_model_zn_rel_pos_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.models_zn_rel_pos_model_zn_rel_pos_id_seq OWNED BY littlelisa_proto.zn_rel_pos.zn_rel_pos_id;


--
-- Name: modules; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.modules (
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


ALTER TABLE littlelisa_proto.modules OWNER TO postgres;

--
-- Name: modules_module_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.modules_module_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.modules_module_id_seq OWNER TO postgres;

--
-- Name: modules_module_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.modules_module_id_seq OWNED BY littlelisa_proto.modules.module_id;


--
-- Name: nodes; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.nodes (
    node_id integer NOT NULL,
    controller_id integer NOT NULL,
    additional_info text
);


ALTER TABLE littlelisa_proto.nodes OWNER TO postgres;

--
-- Name: sensor_data_data_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.sensor_data_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.sensor_data_data_id_seq OWNER TO postgres;

--
-- Name: sensor_data_data_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.sensor_data_data_id_seq OWNED BY littlelisa_proto.sensor_data.data_id;


--
-- Name: sensor_types; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.sensor_types (
    type_id integer NOT NULL,
    type_name character varying(255),
    additional_info text
);


ALTER TABLE littlelisa_proto.sensor_types OWNER TO postgres;

--
-- Name: sensor_types_type_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.sensor_types_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.sensor_types_type_id_seq OWNER TO postgres;

--
-- Name: sensor_types_type_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.sensor_types_type_id_seq OWNED BY littlelisa_proto.sensor_types.type_id;


--
-- Name: sensors; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.sensors (
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


ALTER TABLE littlelisa_proto.sensors OWNER TO postgres;

--
-- Name: sensors_sensor_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.sensors_sensor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.sensors_sensor_id_seq OWNER TO postgres;

--
-- Name: sensors_sensor_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.sensors_sensor_id_seq OWNED BY littlelisa_proto.sensors.sensor_id;


--
-- Name: squares; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.squares (
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


ALTER TABLE littlelisa_proto.squares OWNER TO postgres;

--
-- Name: squares_square_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.squares_square_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.squares_square_id_seq OWNER TO postgres;

--
-- Name: squares_square_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.squares_square_id_seq OWNED BY littlelisa_proto.squares.square_id;


--
-- Name: users; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.users (
    user_id integer NOT NULL,
    username character varying(255) NOT NULL,
    password text NOT NULL,
    email character varying(255) NOT NULL
);


ALTER TABLE littlelisa_proto.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.users_user_id_seq OWNED BY littlelisa_proto.users.user_id;


--
-- Name: watering_log; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.watering_log (
    watering_id integer NOT NULL,
    square_id integer NOT NULL,
    "timestamp" timestamp without time zone,
    amount numeric
);


ALTER TABLE littlelisa_proto.watering_log OWNER TO postgres;

--
-- Name: watering_log_watering_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.watering_log_watering_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.watering_log_watering_id_seq OWNER TO postgres;

--
-- Name: watering_log_watering_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.watering_log_watering_id_seq OWNED BY littlelisa_proto.watering_log.watering_id;


--
-- Name: zones; Type: TABLE; Schema: littlelisa_proto; Owner: postgres
--

CREATE TABLE littlelisa_proto.zones (
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


ALTER TABLE littlelisa_proto.zones OWNER TO postgres;

--
-- Name: zones_zone_id_seq; Type: SEQUENCE; Schema: littlelisa_proto; Owner: postgres
--

CREATE SEQUENCE littlelisa_proto.zones_zone_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE littlelisa_proto.zones_zone_id_seq OWNER TO postgres;

--
-- Name: zones_zone_id_seq; Type: SEQUENCE OWNED BY; Schema: littlelisa_proto; Owner: postgres
--

ALTER SEQUENCE littlelisa_proto.zones_zone_id_seq OWNED BY littlelisa_proto.zones.zone_id;


--
-- Name: cameras camera_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.cameras ALTER COLUMN camera_id SET DEFAULT nextval('littlelisa_proto.cameras_camera_id_seq'::regclass);


--
-- Name: debug_log log_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.debug_log ALTER COLUMN log_id SET DEFAULT nextval('littlelisa_proto.event_log_log_id_seq'::regclass);


--
-- Name: dht22_data data_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.dht22_data ALTER COLUMN data_id SET DEFAULT nextval('littlelisa_proto.sensor_data_data_id_seq'::regclass);


--
-- Name: enviroment_action_log action_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.enviroment_action_log ALTER COLUMN action_id SET DEFAULT nextval('littlelisa_proto.enviroment_action_log_action_id_seq'::regclass);


--
-- Name: enviroment_state state_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.enviroment_state ALTER COLUMN state_id SET DEFAULT nextval('littlelisa_proto.enviroment_state_state_id_seq'::regclass);


--
-- Name: enviromental_control_schedule schedule_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.enviromental_control_schedule ALTER COLUMN schedule_id SET DEFAULT nextval('littlelisa_proto.enviromental_control_schedule_schedule_id_seq'::regclass);


--
-- Name: enviromental_log log_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.enviromental_log ALTER COLUMN log_id SET DEFAULT nextval('littlelisa_proto.enviromental_log_log_id_seq'::regclass);


--
-- Name: fertilizing_log fertilizing_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.fertilizing_log ALTER COLUMN fertilizing_id SET DEFAULT nextval('littlelisa_proto.fertilizing_log_fertilizing_id_seq'::regclass);


--
-- Name: greenhouses greenhouse_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.greenhouses ALTER COLUMN greenhouse_id SET DEFAULT nextval('littlelisa_proto.greenhouse_greenhouse_id_seq'::regclass);


--
-- Name: lighting_log lighting_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.lighting_log ALTER COLUMN lighting_id SET DEFAULT nextval('littlelisa_proto.lighting_log_lighting_id_seq'::regclass);


--
-- Name: modules module_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.modules ALTER COLUMN module_id SET DEFAULT nextval('littlelisa_proto.modules_module_id_seq'::regclass);


--
-- Name: sensor_data data_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.sensor_data ALTER COLUMN data_id SET DEFAULT nextval('littlelisa_proto.sensor_data_data_id_seq'::regclass);


--
-- Name: sensor_types type_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.sensor_types ALTER COLUMN type_id SET DEFAULT nextval('littlelisa_proto.sensor_types_type_id_seq'::regclass);


--
-- Name: sensors sensor_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.sensors ALTER COLUMN sensor_id SET DEFAULT nextval('littlelisa_proto.sensors_sensor_id_seq'::regclass);


--
-- Name: squares square_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.squares ALTER COLUMN square_id SET DEFAULT nextval('littlelisa_proto.squares_square_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.users ALTER COLUMN user_id SET DEFAULT nextval('littlelisa_proto.users_user_id_seq'::regclass);


--
-- Name: watering_log watering_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.watering_log ALTER COLUMN watering_id SET DEFAULT nextval('littlelisa_proto.watering_log_watering_id_seq'::regclass);


--
-- Name: weather weather_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.weather ALTER COLUMN weather_id SET DEFAULT nextval('littlelisa_proto.external_weather_weather_id_seq'::regclass);


--
-- Name: zn_rel_pos zn_rel_pos_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.zn_rel_pos ALTER COLUMN zn_rel_pos_id SET DEFAULT nextval('littlelisa_proto.models_zn_rel_pos_model_zn_rel_pos_id_seq'::regclass);


--
-- Name: zones zone_id; Type: DEFAULT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.zones ALTER COLUMN zone_id SET DEFAULT nextval('littlelisa_proto.zones_zone_id_seq'::regclass);


--
-- Name: cameras cameras_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.cameras
    ADD CONSTRAINT cameras_pkey PRIMARY KEY (camera_id);


--
-- Name: controllers controllers_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.controllers
    ADD CONSTRAINT controllers_pkey PRIMARY KEY (controller_id);


--
-- Name: enviroment_action_log enviroment_action_log_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.enviroment_action_log
    ADD CONSTRAINT enviroment_action_log_pkey PRIMARY KEY (action_id);


--
-- Name: enviroment_state enviroment_state_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.enviroment_state
    ADD CONSTRAINT enviroment_state_pkey PRIMARY KEY (state_id);


--
-- Name: enviromental_control_schedule enviromental_control_schedule_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.enviromental_control_schedule
    ADD CONSTRAINT enviromental_control_schedule_pkey PRIMARY KEY (schedule_id);


--
-- Name: enviromental_log enviromental_log_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.enviromental_log
    ADD CONSTRAINT enviromental_log_pkey PRIMARY KEY (log_id);


--
-- Name: debug_log event_log_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.debug_log
    ADD CONSTRAINT event_log_pkey PRIMARY KEY (log_id);


--
-- Name: weather external_weather_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.weather
    ADD CONSTRAINT external_weather_pkey PRIMARY KEY (weather_id);


--
-- Name: fertilizing_log fertilizing_log_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.fertilizing_log
    ADD CONSTRAINT fertilizing_log_pkey PRIMARY KEY (fertilizing_id);


--
-- Name: greenhouses greenhouse_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.greenhouses
    ADD CONSTRAINT greenhouse_pkey PRIMARY KEY (greenhouse_id);


--
-- Name: lighting_log lighting_log_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.lighting_log
    ADD CONSTRAINT lighting_log_pkey PRIMARY KEY (lighting_id);


--
-- Name: zn_rel_pos models_zn_rel_pos_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.zn_rel_pos
    ADD CONSTRAINT models_zn_rel_pos_pkey PRIMARY KEY (zn_rel_pos_id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (module_id);


--
-- Name: nodes nodes_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.nodes
    ADD CONSTRAINT nodes_pkey PRIMARY KEY (node_id);


--
-- Name: sensor_data sensor_data_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.sensor_data
    ADD CONSTRAINT sensor_data_pkey PRIMARY KEY (data_id);


--
-- Name: sensor_types sensor_types_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.sensor_types
    ADD CONSTRAINT sensor_types_pkey PRIMARY KEY (type_id);


--
-- Name: sensors sensors_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.sensors
    ADD CONSTRAINT sensors_pkey PRIMARY KEY (sensor_id);


--
-- Name: squares squares_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.squares
    ADD CONSTRAINT squares_pkey PRIMARY KEY (square_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: watering_log watering_log_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.watering_log
    ADD CONSTRAINT watering_log_pkey PRIMARY KEY (watering_id);


--
-- Name: zones zones_pkey; Type: CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.zones
    ADD CONSTRAINT zones_pkey PRIMARY KEY (zone_id);


--
-- Name: greenhouses create_initial_zone_and_squares_trigger; Type: TRIGGER; Schema: littlelisa_proto; Owner: postgres
--

CREATE TRIGGER create_initial_zone_and_squares_trigger AFTER INSERT ON littlelisa_proto.greenhouses FOR EACH ROW EXECUTE FUNCTION littlelisa_proto.create_initial_zone_and_squares();


--
-- Name: zones update_squares_on_zone_change; Type: TRIGGER; Schema: littlelisa_proto; Owner: postgres
--

CREATE TRIGGER update_squares_on_zone_change AFTER INSERT OR UPDATE OF zone_start_point, x_length, y_length ON littlelisa_proto.zones FOR EACH ROW EXECUTE FUNCTION littlelisa_proto.update_square_zone_ids();


--
-- Name: zones update_squares_on_zone_insert; Type: TRIGGER; Schema: littlelisa_proto; Owner: postgres
--

CREATE TRIGGER update_squares_on_zone_insert AFTER INSERT ON littlelisa_proto.zones FOR EACH ROW EXECUTE FUNCTION littlelisa_proto.update_square_zone_ids();


--
-- Name: cameras fk_cameras_zones; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.cameras
    ADD CONSTRAINT fk_cameras_zones FOREIGN KEY (zone_id) REFERENCES littlelisa_proto.zones(zone_id) ON DELETE CASCADE;


--
-- Name: controllers fk_controllers_modules; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.controllers
    ADD CONSTRAINT fk_controllers_modules FOREIGN KEY (controller_id) REFERENCES littlelisa_proto.modules(module_id) ON DELETE CASCADE;


--
-- Name: debug_log fk_debug_log_module; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.debug_log
    ADD CONSTRAINT fk_debug_log_module FOREIGN KEY (module_id) REFERENCES littlelisa_proto.modules(module_id) ON DELETE CASCADE;


--
-- Name: enviroment_action_log fk_env_action_log_square; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.enviroment_action_log
    ADD CONSTRAINT fk_env_action_log_square FOREIGN KEY (square_id) REFERENCES littlelisa_proto.squares(square_id) ON DELETE CASCADE;


--
-- Name: enviroment_action_log fk_env_action_log_zone; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.enviroment_action_log
    ADD CONSTRAINT fk_env_action_log_zone FOREIGN KEY (zone_id) REFERENCES littlelisa_proto.zones(zone_id) ON DELETE CASCADE;


--
-- Name: enviromental_control_schedule fk_env_cntrl_scheld_module; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.enviromental_control_schedule
    ADD CONSTRAINT fk_env_cntrl_scheld_module FOREIGN KEY (controller_id) REFERENCES littlelisa_proto.modules(module_id) ON DELETE CASCADE;


--
-- Name: enviromental_log fk_env_log_greenhouses; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.enviromental_log
    ADD CONSTRAINT fk_env_log_greenhouses FOREIGN KEY (greenhouse_id) REFERENCES littlelisa_proto.greenhouses(greenhouse_id) ON DELETE CASCADE;


--
-- Name: enviroment_state fk_env_state_module; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.enviroment_state
    ADD CONSTRAINT fk_env_state_module FOREIGN KEY (controller_id) REFERENCES littlelisa_proto.modules(module_id) ON DELETE CASCADE;


--
-- Name: fertilizing_log fk_fert_log_square; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.fertilizing_log
    ADD CONSTRAINT fk_fert_log_square FOREIGN KEY (square_id) REFERENCES littlelisa_proto.squares(square_id) ON DELETE CASCADE;


--
-- Name: greenhouses fk_greenhouse_users; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.greenhouses
    ADD CONSTRAINT fk_greenhouse_users FOREIGN KEY (owner_id) REFERENCES littlelisa_proto.users(user_id) ON DELETE CASCADE;


--
-- Name: lighting_log fk_lighting_logs_zones; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.lighting_log
    ADD CONSTRAINT fk_lighting_logs_zones FOREIGN KEY (zone_id) REFERENCES littlelisa_proto.zones(zone_id) ON DELETE CASCADE;


--
-- Name: modules fk_module_greenhouse; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.modules
    ADD CONSTRAINT fk_module_greenhouse FOREIGN KEY (greenhouse_id) REFERENCES littlelisa_proto.greenhouses(greenhouse_id) ON DELETE CASCADE;


--
-- Name: modules fk_module_zones; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.modules
    ADD CONSTRAINT fk_module_zones FOREIGN KEY (zone_id) REFERENCES littlelisa_proto.zones(zone_id) ON DELETE CASCADE;


--
-- Name: modules fk_modules_square; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.modules
    ADD CONSTRAINT fk_modules_square FOREIGN KEY (square_id) REFERENCES littlelisa_proto.squares(square_id);


--
-- Name: modules fk_modules_zn_rel_pos; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.modules
    ADD CONSTRAINT fk_modules_zn_rel_pos FOREIGN KEY (zn_rel_pos_id) REFERENCES littlelisa_proto.zn_rel_pos(zn_rel_pos_id);


--
-- Name: sensors fk_sensor_square; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.sensors
    ADD CONSTRAINT fk_sensor_square FOREIGN KEY (square_id) REFERENCES littlelisa_proto.squares(square_id);


--
-- Name: sensors fk_sensors_modules; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.sensors
    ADD CONSTRAINT fk_sensors_modules FOREIGN KEY (module_id) REFERENCES littlelisa_proto.modules(module_id) ON DELETE CASCADE;


--
-- Name: sensors fk_sensors_sensor_types; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.sensors
    ADD CONSTRAINT fk_sensors_sensor_types FOREIGN KEY (type_id) REFERENCES littlelisa_proto.sensor_types(type_id) ON DELETE CASCADE;


--
-- Name: sensors fk_sensors_zn_rel_pos; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.sensors
    ADD CONSTRAINT fk_sensors_zn_rel_pos FOREIGN KEY (zn_rel_pos_id) REFERENCES littlelisa_proto.zn_rel_pos(zn_rel_pos_id);


--
-- Name: squares fk_squares_zones; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.squares
    ADD CONSTRAINT fk_squares_zones FOREIGN KEY (zone_id) REFERENCES littlelisa_proto.zones(zone_id) ON DELETE CASCADE;


--
-- Name: watering_log fk_watering_log_squares; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.watering_log
    ADD CONSTRAINT fk_watering_log_squares FOREIGN KEY (square_id) REFERENCES littlelisa_proto.squares(square_id) ON DELETE CASCADE;


--
-- Name: weather fk_weather_greenhouse; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.weather
    ADD CONSTRAINT fk_weather_greenhouse FOREIGN KEY (greenhouse_id) REFERENCES littlelisa_proto.greenhouses(greenhouse_id) ON DELETE CASCADE;


--
-- Name: zones fk_zones_greenhouses; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.zones
    ADD CONSTRAINT fk_zones_greenhouses FOREIGN KEY (greenhouse_id) REFERENCES littlelisa_proto.greenhouses(greenhouse_id) ON DELETE CASCADE;


--
-- Name: zn_rel_pos models_zn_rel_pos_zone_id_fkey; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.zn_rel_pos
    ADD CONSTRAINT models_zn_rel_pos_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES littlelisa_proto.zones(zone_id) ON DELETE CASCADE;


--
-- Name: nodes nodes_controller_id_fkey; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.nodes
    ADD CONSTRAINT nodes_controller_id_fkey FOREIGN KEY (controller_id) REFERENCES littlelisa_proto.controllers(controller_id) ON DELETE CASCADE;


--
-- Name: nodes nodes_node_id_fkey; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.nodes
    ADD CONSTRAINT nodes_node_id_fkey FOREIGN KEY (node_id) REFERENCES littlelisa_proto.modules(module_id) ON DELETE CASCADE;


--
-- Name: sensor_data sensor_data_sensor_id_fkey; Type: FK CONSTRAINT; Schema: littlelisa_proto; Owner: postgres
--

ALTER TABLE ONLY littlelisa_proto.sensor_data
    ADD CONSTRAINT sensor_data_sensor_id_fkey FOREIGN KEY (sensor_id) REFERENCES littlelisa_proto.sensors(sensor_id) ON DELETE CASCADE;


--
-- Name: SCHEMA littlelisa_proto; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON SCHEMA littlelisa_proto TO little_lisa;


--
-- Name: TABLE cameras; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.cameras TO little_lisa;


--
-- Name: SEQUENCE cameras_camera_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT ALL ON SEQUENCE littlelisa_proto.cameras_camera_id_seq TO little_lisa;


--
-- Name: TABLE controllers; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.controllers TO little_lisa;


--
-- Name: TABLE debug_log; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.debug_log TO little_lisa;


--
-- Name: TABLE sensor_data; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.sensor_data TO little_lisa;


--
-- Name: TABLE dht22_data; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.dht22_data TO little_lisa;


--
-- Name: TABLE enviroment_action_log; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.enviroment_action_log TO little_lisa;


--
-- Name: SEQUENCE enviroment_action_log_action_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT ALL ON SEQUENCE littlelisa_proto.enviroment_action_log_action_id_seq TO little_lisa;


--
-- Name: TABLE enviroment_state; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.enviroment_state TO little_lisa;


--
-- Name: SEQUENCE enviroment_state_state_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT ALL ON SEQUENCE littlelisa_proto.enviroment_state_state_id_seq TO little_lisa;


--
-- Name: TABLE enviromental_control_schedule; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.enviromental_control_schedule TO little_lisa;


--
-- Name: SEQUENCE enviromental_control_schedule_schedule_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT ALL ON SEQUENCE littlelisa_proto.enviromental_control_schedule_schedule_id_seq TO little_lisa;


--
-- Name: TABLE enviromental_log; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.enviromental_log TO little_lisa;


--
-- Name: SEQUENCE enviromental_log_log_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT ALL ON SEQUENCE littlelisa_proto.enviromental_log_log_id_seq TO little_lisa;


--
-- Name: SEQUENCE event_log_log_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT ALL ON SEQUENCE littlelisa_proto.event_log_log_id_seq TO little_lisa;


--
-- Name: TABLE weather; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.weather TO little_lisa;


--
-- Name: SEQUENCE external_weather_weather_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT ALL ON SEQUENCE littlelisa_proto.external_weather_weather_id_seq TO little_lisa;


--
-- Name: TABLE fertilizing_log; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.fertilizing_log TO little_lisa;


--
-- Name: SEQUENCE fertilizing_log_fertilizing_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT ALL ON SEQUENCE littlelisa_proto.fertilizing_log_fertilizing_id_seq TO little_lisa;


--
-- Name: TABLE greenhouses; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.greenhouses TO little_lisa;


--
-- Name: SEQUENCE greenhouse_greenhouse_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT ALL ON SEQUENCE littlelisa_proto.greenhouse_greenhouse_id_seq TO little_lisa;


--
-- Name: TABLE lighting_log; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.lighting_log TO little_lisa;


--
-- Name: SEQUENCE lighting_log_lighting_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT ALL ON SEQUENCE littlelisa_proto.lighting_log_lighting_id_seq TO little_lisa;


--
-- Name: TABLE zn_rel_pos; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.zn_rel_pos TO little_lisa;


--
-- Name: SEQUENCE models_zn_rel_pos_model_zn_rel_pos_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT USAGE ON SEQUENCE littlelisa_proto.models_zn_rel_pos_model_zn_rel_pos_id_seq TO little_lisa;


--
-- Name: TABLE modules; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.modules TO little_lisa;


--
-- Name: SEQUENCE modules_module_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT ALL ON SEQUENCE littlelisa_proto.modules_module_id_seq TO little_lisa;


--
-- Name: TABLE nodes; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.nodes TO little_lisa;


--
-- Name: SEQUENCE sensor_data_data_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT ALL ON SEQUENCE littlelisa_proto.sensor_data_data_id_seq TO little_lisa;


--
-- Name: TABLE sensor_types; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.sensor_types TO little_lisa;


--
-- Name: SEQUENCE sensor_types_type_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT ALL ON SEQUENCE littlelisa_proto.sensor_types_type_id_seq TO little_lisa;


--
-- Name: TABLE sensors; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.sensors TO little_lisa;


--
-- Name: SEQUENCE sensors_sensor_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT ALL ON SEQUENCE littlelisa_proto.sensors_sensor_id_seq TO little_lisa;


--
-- Name: TABLE squares; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.squares TO little_lisa;


--
-- Name: SEQUENCE squares_square_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT ALL ON SEQUENCE littlelisa_proto.squares_square_id_seq TO little_lisa;


--
-- Name: TABLE users; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.users TO little_lisa;


--
-- Name: SEQUENCE users_user_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT ALL ON SEQUENCE littlelisa_proto.users_user_id_seq TO little_lisa;


--
-- Name: TABLE watering_log; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.watering_log TO little_lisa;


--
-- Name: SEQUENCE watering_log_watering_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT ALL ON SEQUENCE littlelisa_proto.watering_log_watering_id_seq TO little_lisa;


--
-- Name: TABLE zones; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE littlelisa_proto.zones TO little_lisa;


--
-- Name: SEQUENCE zones_zone_id_seq; Type: ACL; Schema: littlelisa_proto; Owner: postgres
--

GRANT ALL ON SEQUENCE littlelisa_proto.zones_zone_id_seq TO little_lisa;


--
-- PostgreSQL database dump complete
--

