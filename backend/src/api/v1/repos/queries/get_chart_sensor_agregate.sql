SELECT
    DATE_TRUNC('hour', timestamp) AS hour,
    AVG(temperature) AS avg_temp,
    avg(humidity) as avg_humidity
FROM dht22_data
WHERE timestamp >= now() - '7 days'::interval
GROUP BY hour
ORDER BY hour;