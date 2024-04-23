--SET SCHEMA 'littlelisa_proto';
CREATE TABLE greenhouses (
        greenhouse_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location TEXT NOT NULL,
        owner_id INTEGER NOT NULL
        );

CREATE TABLE zones(
        zone_id SERIAL PRIMARY KEY,
        greenhouse_id INTEGER,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        length INT NOT NULL,
        width INT NOT NULL
        );

--ALTER TABLE greenhouses
--ADD COLUMN height INT NOT NULL,
--ADD COLUMN width INT NOT NULL;

CREATE TABLE squares(
        square_id SERIAL PRIMARY KEY,
        zone_id INTEGER NOT NULL,
        "row" INTEGER NOT NULL,
        "column" INTEGER NOT NULL,
        plant_type VARCHAR(255),
        date_planted DATE,
        date_expeceted_harvest DATE,
        notes TEXT,
        is_transplant BOOLEAN DEFAULT FALSE
        );
        
CREATE TABLE "modules" (
        module_id SERIAL PRIMARY KEY,
        greenhouse_id INTEGER NOT NULL,
        zone_id INTEGER,
        type VARCHAR NOT NULL,
        identifier VARCHAR(25),
        firmware_version VARCHAR(255),
        date_compilied DATE,
        location TEXT
        );

CREATE TABLE nodes (
        node_id SERIAL PRIMARY KEY,
        controller_id INTEGER NOT NULL
        );
        
CREATE TABLE sensor_config(
        config_id SERIAL PRIMARY KEY,
        module_id INTEGER,
        sensor_type VARCHAR(255),
        count INTEGER
        );

CREATE TABLE sensors(
        sensor_id SERIAL PRIMARY KEY,
        module_id INTEGER NOT NULL,
        sensor_type VARCHAR(255),
        module_pin INTEGER NOT NULL,
        location VARCHAR(255)
        );
     
CREATE TABLE dht22_data(
        data_id SERIAL PRIMARY KEY,
        sensor_id INTEGER NOT NULL,
        "timestamp" TIMESTAMP,
        temperature NUMERIC,
        humidity NUMERIC
        );
        
CREATE TABLE cameras(
        camera_id SERIAL PRIMARY KEY,
        zone_id INTEGER NOT NULL,
        location VARCHAR(255),
        description TEXT,
        stream_url TEXT
        );
        
CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL
        );
     
CREATE TABLE debug_log(
        log_id SERIAL PRIMARY KEY,
        module_id INTEGER NOT NULL,
        log_type VARCHAR(255),
        log TEXT,
        "timestamp" TIMESTAMP
        );
        
CREATE TABLE enviroment_action_log(
        action_id SERIAL PRIMARY KEY,
        square_id INTEGER, 
        zone_id INTEGER,
        greenhouse_id INTEGER NOT NULL,
        action_type VARCHAR(255),
        detail TEXT,
        "timestamp" TIMESTAMP
        );
  
CREATE TABLE enviroment_state (
        state_id SERIAL PRIMARY KEY,
        controller_id INTEGER NOT NULL,
        last_update TIMESTAMP NOT NULL,
        light_state TEXT NOT NULL,
        water_state TEXT NOT NULL,
        fan_state TEXT NOT NULL,
        other_state TEXT
        );
        
CREATE TABLE external_weather(
        weather_id SERIAL PRIMARY KEY,
        greenhouse_id INTEGER NOT NULL,
        "date" DATE,
        temperature NUMERIC,
        humidity NUMERIC,
        precipatation NUMERIC,
        windspeed NUMERIC,
        other TEXT
        );
CREATE TABLE enviromental_log(
        log_id SERIAL PRIMARY KEY,
        greenhouse_id INTEGER NOT NULL,
        "date" DATE NOT NULL,
        log TEXT NOT NULL
        );
        
CREATE TABLE watering_log(
        watering_id SERIAL PRIMARY KEY,
        square_id INTEGER NOT NULL,
        "timestamp" TIMESTAMP,
        amount NUMERIC
        );
        
CREATE TABLE lighting_log(
        lighting_id SERIAL PRIMARY KEY,
        zone_id INTEGER NOT NULL,
        "timestamp" TIMESTAMP,
        duration NUMERIC
        );
        
CREATE TABLE fertilizing_log(
        fertilizing_id SERIAL PRIMARY KEY,
        square_id INTEGER NOT NULL,
        "timestamp" TIMESTAMP,
        type VARCHAR(255),
        amount NUMERIC
        );
        
CREATE TABLE enviromental_control_schedule(
        schedule_id SERIAL PRIMARY KEY,
        controller_id INTEGER NOT NULL,
        action_type VARCHAR(255) NOT NULL,
        start_date DATE,
        end_date DATE,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        frequency TEXT NOT NULL,
        detail TEXT,
        is_active BOOLEAN
        );
        
        
        
        
 