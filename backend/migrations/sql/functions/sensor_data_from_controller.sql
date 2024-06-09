create or replace function add_sensor_data(sensor_data jsonb)
returns void
language plpgsql
as
$$
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
    m_adjusted_x int;
    m_adjusted_y int;
    s_adjusted_x int;
    s_adjusted_y int;
    z_strt_pt point;
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


    --check if greenhouse/zone exist throwe exception if not
    if not exists ( select 1 from greenhouses where greenhouses.greenhouse_id = gh_id)
    then raise exception 'Greenhouse % not found, rollingback data insert...', gh_id;
    end if;

    if not exists ( select 1 from zones where zone_number = z_num)
    then raise exception 'Zone % not found, rollingback data insert...', z_num;
    else
        SELECT zone_id, zone_start_point INTO z_id, z_strt_pt FROM zones WHERE zone_number = z_num;
    end if;




    IF (sensor_data -> 'module_info' -> 'square_pos') ? 'x' THEN
        m_pos_x := (sensor_data -> 'module_info' -> 'square_pos' ->> 'x')::INT;
        m_pos_y := (sensor_data -> 'module_info' -> 'square_pos' ->> 'y')::INT;
            m_zn_rel_pos_x := NULL;
        m_zn_rel_pos_y := NULL;
        m_zn_rel_pos_z := NULL;
        module_square_pos := true;
        m_adjusted_x := m_pos_x + z_strt_pt[0] - 1;
    m_adjusted_y := m_pos_y + z_strt_pt[1] -1;
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
        s_pos_x := (sensor_data -> 'sensor_info' -> 'square_pos' ->> 'x')::INT;
        s_pos_y := (sensor_data -> 'sensor_info' -> 'square_pos' ->> 'y')::INT;
                s_zn_rel_pos_x := NULL;
        s_zn_rel_pos_y := NULL;
        s_zn_rel_pos_z := NULL;
        sensor_square_pos := true;
        s_adjusted_x := s_pos_x + z_strt_pt[0] -1;
    s_adjusted_y := s_pos_y + z_strt_pt[1]-1;
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





--get the square/zn_rel ids for module and sensor


    if module_square_pos is true
    then
        select square_id into m_selected_square_id from squares
         --adjust for zone starting point offset in global square id grid
        where x_pos = m_adjusted_x and y_pos = m_adjusted_y;
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
        --adjust for zone starting point offset in global square id grid
        where x_pos = s_adjusted_x and y_pos = s_adjusted_y;
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