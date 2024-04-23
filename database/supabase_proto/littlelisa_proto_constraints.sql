ALTER TABLE greenhouses
ADD CONSTRAINT fk_greenhouse_users
FOREIGN KEY (owner_id)
REFERENCES users (user_id);

ALTER TABLE zones
ADD CONSTRAINT fk_zones_greenhouses
FOREIGN KEY (greenhouse_id)
REFERENCES greenhouses(greenhouse_id);

ALTER TABLE squares
ADD CONSTRAINT fk_squares_zones
FOREIGN KEY (zone_id)
REFERENCES zones (zone_id);

ALTER TABLE modules
ADD CONSTRAINT fk_module_greenhouse
FOREIGN KEY (greenhouse_id)
REFERENCES greenhouses(greenhouse_id),

ADD CONSTRAINT fk_module_zones
FOREIGN KEY (zone_id)
REFERENCES zones(zone_id);

ALTER TABLE nodes
ADD CONSTRAINT fk_nodes_module
FOREIGN KEY (controller_id)
REFERENCES modules(module_id);

ALTER TABLE weather
ADD CONSTRAINT fk_weather_greenhouse
FOREIGN KEY (greenhouse_id)
REFERENCES greenhouses(greenhouse_id);

ALTER TABLE enviromental_control_schedule
ADD CONSTRAINT fk_env_cntrl_scheld_module
FOREIGN KEY (controller_id)
REFERENCES modules(module_id);

ALTER TABLE enviroment_action_log
ADD CONSTRAINT fk_env_action_log_square
FOREIGN KEY (square_id)
REFERENCES squares(square_id),

ADD CONSTRAINT fk_env_action_log_zone
FOREIGN KEY (zone_id)
REFERENCES zones(zone_id);

ALTER TABLE debug_log
ADD CONSTRAINT fk_debug_log_module
FOREIGN KEY(module_id)
REFERENCES modules(module_id);

ALTER TABLE enviroment_state
ADD CONSTRAINT fk_env_state_module
FOREIGN KEY (controller_id)
REFERENCES modules(module_id);

ALTER TABLE fertilizing_log
ADD CONSTRAINT fk_fert_log_square
FOREIGN KEY (square_id)
REFERENCES squares(square_id);

ALTER TABLE sensor_config
ADD CONSTRAINT fk_sensor_config_module
FOREIGN KEY (module_id)
REFERENCES modules(module_id);

ALTER TABLE dht22_data
ADD CONSTRAINT fk_dht22_data_sensors
FOREIGN KEY (sensor_id)
REFERENCES sensors(sensor_id);

ALTER TABLE sensors
ADD CONSTRAINT fk_sensors_modules
FOREIGN KEY (module_id)
REFERENCES modules(module_id);

ALTER TABLE watering_log
ADD CONSTRAINT fk_watering_log_squares
FOREIGN KEY (square_id)
REFERENCES squares(square_id);

ALTER TABLE lighting_log
ADD CONSTRAINT fk_lighting_logs_zones
FOREIGN KEY (zone_id)
REFERENCES zones(zone_id);

ALTER TABLE cameras
ADD CONSTRAINT fk_cameras_zones
FOREIGN KEY (zone_id)
REFERENCES zones(zone_id);

ALTER TABLE enviromental_log
ADD CONSTRAINT fk_env_log_greenhouses
FOREIGN KEY (greenhouse_id)
REFERENCES greenhouses(greenhouse_id);






