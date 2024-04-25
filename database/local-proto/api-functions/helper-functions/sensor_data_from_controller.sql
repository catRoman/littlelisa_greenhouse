create function add_sensor_data(sensor_data jsonb)
returns void
language plpgsql
as
$$
declare
    --jsonb data
    --greenhouse info
    greenhouse_id int;
    zone_id int;
    --module info
    controller_identifier varchar(25);
    module_type varchar(25);
    firmware_version varchar(10);
    date_compilied_str varchar(30);
    date_compiled timestamp;
    identifier varchar(25);
    module_location varchar(50);
    sensor_id int;
    --sensor info
    sensor_pin int;
    sensor_type varchar(25);
    sensor_timestamp_str varchar(30);
    sensor_timestamp timestamp;
    sensor_location varchar(50);
    sensor_data jsonb;


    --helper variables
    module_type_table text;
    module_id int;
    controller_id int;
begin
    --extract data fron jsonb
    --greenhouse info
    greenhouse_id := sensor_data->'greenhouse_info'->>'greenhouse_id';
    zone_id  :=sensor_data->'greenhouse_id'->>'zone_id';
    --module info
    controller_identifier  :=sensor_data->'module_info'->>'controller_identifier';
    firmware_version  :=sensor_data->'module_info'->>'firmware_version';
    module_type :=sensor_data->'module_info'->>'type';
    date_compilied_str  :=sensor_data->'module_info'->>'date_compilied';
    date_compiled  := to_timestamp(date_compilied_str, 'YYY_MM_DD HH24:MI:SS');
    identifier  :=sensor_data->'module_info'->>'identifier';
    module_location  :=sensor_data->'module_info'->>'location';
    sensor_id  :=sensor_data->'module_info'->>'sensor_id';
    --sensor info
    sensor_pin  :=sensor_data->'sensor_info'->>'sensor_pin';
    sensor_type  :=sensor_data->'sensor_info'->>'sensor_type';
    sensor_timestamp_str  :=sensor_data->'sensor_info'->>'timestamp';
    sensor_timestamp := to_timestamp(sensor_timestamp_str, 'YYY_MM_DD HH24:MI:SS');
    sensor_location  :=sensor_data->'sensor_info'->>'location';
    sensor_data jsonb :=sensor_data->'sensor_info'->>'data';



    --check if greenhouse/zone exist throwe exception if not
    if not exists ( select 1 from greenhouses where greenhouse_id = greenhouse_id)
    then raise exception 'Greenhouse % not found, rollingback data insert...', greenhouse_id;
    end if;

    if not exists ( select 1 from zones where zone_id = zone_id)
    then raise exception 'Zone % not found, rollingback data insert...', zone_id;
    end if;

    --check if module exist create/update
    if exists (
        select 1
        from modules
        where identifier = identifier
        and (
            greenhouse_id != greenhouse_id or
            zone_id != zone_id or
            firmware_version != firmware_version or
            date_compilied != date_compilied or
            location != module_location
            ))
    then
        update modules
        -- module exists but  data needs updating
        set
            greenhouse_id = greenhouse_id,
            zone_id = zone_id,
            firmware_version = firmware_version,
            date_compilied = date_compiled,
            location = module_location
        where identifier = identifier
        returning
    else
        -- module not found
        insert into modules (greenhouse_id, zone_id, identifier, firmware_version, date_compilied, location )
        values (greenhouse_id, zone_id, firmware_version, date_compilied, module_location);
    end if;

    --get module_id of current module created/updated
    SELECT module_id INTO module_id FROM modules WHERE identifier = identifier;

    --create/update node/controller table based on type
    if module_type = 'controller'
    then
        --check/update controllers table
        if not exists( select 1 from controllers where controller_id = module_id)
        then
            --controller not in controller list/ adding row
            insert into controllers(controller_id)
            values(module_id);
    --create/update node list
    elsif module_type = 'node'
    then
        --check if node exists/ verify correct controller
         begin
            if not exists (
                select 1
                from nodes
                join controllers on nodes.controller_id = controllers.controller_id
                join modules on controllers.controller_id = modules.module_id -- Key change here
                where nodes.node_id = module_id
                and modules.identifier = controller_identifier)
            then
            --node doesnt exist, first verify that the controller id is valid then create
            --node in list
                if not exists (
                    select 1
                    from controllers
                    join modules on controllers.module_id = modules.module_id
                    where modules.identifier = controller_identifier)
                then
                    raise exception 'node-controller issue: controller with identifier % does not exist, rollling back...', controller_identifier;
                else
                    --get controller id for node table
                    begin
                        select controller_id into controller_id
                        from controllers join modules on controllers.module_id = modules.module_id
                        where modules.identifier = controller_identifier;

                        --add the node to the list
                        insert into nodes (node_id, controller_id)
                        values (module_id, controller_id);

                    end;
                end if;
            end if;

         end;
    else raise exception 'Module type: % -> invalid, rolling back....', module_type;
    end if;


    --create/update sensors based on sesnor_id
    --ceck if sensor type exists if not throw exception
    --adjsut timestamp using use_timestamp to sensor_data
    --add sensor data to corresponding inherited sensor_data type
    --based on type


end;
$$;