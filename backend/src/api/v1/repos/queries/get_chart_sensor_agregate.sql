-- SELECT
--     DATE_TRUNC('hour', timestamp) AS hour,
--     AVG(temperature) AS dht22_avg_temp,
--     avg(humidity) as dht22_avg_humidity
-- FROM dht22_data d
-- join sensors s on d.sensor_id = s.sensor_id
-- join modules m on m.module_id = s.module_id
-- WHERE timestamp >= now() - '7 days'::interval and
--  m.zone_id = 3;

-- GROUP BY hour
-- ORDER BY hour;

-- select distinct
--         st.type_name as type
--       from sensors s
--       join sensor_types st on s.type_id = st.type_id
--       join modules m on m.module_id = s.module_id
--       where m.greenhouse_id = $1;

  SELECT
            DATE_TRUNC('hour', timestamp ) AS grouping,
            AVG(temperature) AS dht22_avg_temp,
            avg(humidity) as dht22_avg_humidity
          FROM dht22_data d
          join sensors s on d.sensor_id = s.sensor_id
          join modules m on m.module_id = s.module_id
          WHERE timestamp >= now()  - '7 days'::interval
            and m.greenhouse_id = 1
          GROUP BY grouping
          ORDER BY grouping;