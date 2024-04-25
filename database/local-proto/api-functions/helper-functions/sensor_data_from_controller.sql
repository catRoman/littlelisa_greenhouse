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
    --module info
    c_id varchar(25);
    m_type varchar(25);
    f_ver varchar(10);
    d_comp_str varchar(30);
    d_comp timestamp;
    id varchar(25);
    m_loc varchar(50);
    s_id int;
    --sensor info
    s_pin int;
    s_type varchar(25);
    s_ts_str varchar(30);
    s_ts timestamp;
    s_loc varchar(50);



    --helper variables
    mod_id int;
    con_id int;
    s_type_id int;
begin
    --extract data fron jsonb
    --greenhouse info
    gh_id := sensor_data->'greenhouse_info'->>'greenhouse_id';
    z_id  :=sensor_data->'greenhouse_info'->>'zone_id';
    --module info
    c_id  :=sensor_data->'module_info'->>'controller_identifier';
    f_ver  :=sensor_data->'module_info'->>'firmware_version';
    m_type :=sensor_data->'module_info'->>'type';
    d_comp_str  :=sensor_data->'module_info'->>'date_compilied';
        --adjsut timestamp for postgres str exp. "Apr 25 2024 01:12:09"
    d_comp  := to_timestamp(d_comp_str, 'Mon DD YYYY HH24:MI:SS');
    id  :=sensor_data->'module_info'->>'identifier';
    m_loc  :=sensor_data->'module_info'->>'location';
    s_id  :=sensor_data->'module_info'->>'sensor_id';
    --sensor info
    s_pin  :=sensor_data->'sensor_info'->>'sensor_pin';
    s_type  :=sensor_data->'sensor_info'->>'sensor_type';
    s_ts_str  :=sensor_data->'sensor_info'->>'timestamp';
        --adjsut timestamp for postgres str exp. 'Thu Apr 25 00:43:14 2024'
    s_ts := to_timestamp(s_ts_str, 'Dy Mon DD HH24:MI:SS YYYY');
    s_loc  :=sensor_data->'sensor_info'->>'location';

    --variable sensor data




    --check if greenhouse/zone exist throwe exception if not
    if not exists ( select 1 from greenhouses where greenhouses.greenhouse_id = gh_id)
    then raise exception 'Greenhouse % not found, rollingback data insert...', gh_id;
    end if;

    if not exists ( select 1 from zones where zone_id = z_id)
    then raise exception 'Zone % not found, rollingback data insert...', z_id;
    end if;

    --check if module exist create/update
    if exists (
        select 1
        from modules
        where identifier = id
        and (
            greenhouse_id != gh_id or
            zone_id != z_id or
            firmware_version != f_ver or
            date_compilied != d_comp or
            location != m_loc
            ))
    then
        -- module exists but  data needs updating
        update modules
        set
            greenhouse_id = gh_id,
            zone_id = z_id,
            firmware_version = f_ver,
            date_compilied = d_comp,
            location = m_loc
        where identifier = id;
    else
        -- module not found
        insert into modules (greenhouse_id, zone_id, identifier, firmware_version, date_compilied, location )
        values (gh_id, z_id, id, f_ver, d_comp, m_loc);
    end if;

    --get module_id of current module created/updated
    SELECT module_id INTO mod_id FROM modules WHERE identifier = id;

    --create/update node/controller table based on type
    if m_type = 'controller'
    then
        --check/update controllers table
        if not exists( select 1 from controllers where controller_id = mod_id)
        then
            --controller not in controller list/ adding row
            insert into controllers(controller_id)
            values(mod_id);
        end if;
    --create/update node list
    elsif m_type = 'node'
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
                    join modules on controllers.module_id = modules.module_id
                    where modules.identifier = c_id)
                then
                    raise exception 'node-controller issue: controller with identifier % does not exist, rollling back...', c_id;
                else
                    --get controller id for node table
                    begin
                        select controller_id into con_id
                        from controllers join modules on controllers.module_id = modules.module_id
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
        where sensor_id = s_id
        and (
            module_id != mod_id or
            sensor_pin != s_pin or
            location != s_loc or
            type_id != s_type_id
            ))
    then
        update sensors
        -- module exists but  data needs updating
        set
            module_id = mod_id,
            sensor_pin = s_pin,
            location = s_loc,
            type_id = s_type_id
        where sensor_id = s_id;

    else
        -- module not found
        insert into sensors (module_id, sensor_pin, location, type_id )
        values (mod_id, s_pin, s_loc, s_type_id);
    end if;

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