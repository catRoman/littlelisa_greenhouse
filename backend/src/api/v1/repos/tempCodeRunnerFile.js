    const interval = `'${last} ${unit}'`;
      if (types[i] === "DHT22") {
        const query = await this.query(
          `
          SELECT
            DATE_TRUNC($1, timestamp ) AS grouping,
            AVG(temperature) AS dht22_avg_temp,
            avg(humidity) as dht22_avg_humidity
          FROM dht22_data d
          join sensors s on d.sensor_id = s.sensor_id
          join modules m on m.module_id = s.module_id
          WHERE timestamp >= now()  - $2::interval
            and m.zone_id = $3
          GROUP BY grouping
          ORDER BY grouping;
          `,

          [grouping, interval, zoneId]
        );
        const formattedData = query.map((row) => ({
          period: moment
            .tz(row.grouping, "UTC")
            .tz("America/Los_Angeles")
            .format("MMM DD, HH:mm"),

          dht22_avgTemp: parseFloat(parseFloat(row.dht22_avg_temp).toFixed(2)), // No need to parseFloat
          dht22_avgHumidity: parseFloat(
            parseFloat(row.dht22_avg_humidity).toFixed(2)
          ), // No need to parseFloat
        }));

        data.push(formattedData);
      }
    }
