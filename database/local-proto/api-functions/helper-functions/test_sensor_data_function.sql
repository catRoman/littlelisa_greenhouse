select add_sensor_data('{
  "greenhouse_info": { "greenhouse_id": 1, "zone_id": 1 },
  "module_info": {
    "controller_identifier": "d4:8a:fc:d0:50:41",
    "type": "controller",
    "firmware_version": "0.1.",
    "date_compilied": "Apr 25 2024 01:12:09",
    "identifier": "d4:8a:fc:d0:50:41",
    "location": "harage",
    "sensor_id": 1
  },
  "sensor_info": {
    "sensor_pin": 26,
    "sensor_type": "DHT22",
    "timestamp": "Thu Apr 25 00:43:14 2024",
    "location": "Unknown-26",
    "data": { "temperature": 20.100000381469727, "humidity": 48.9000015258789 }
  }
}'::jsonb);
