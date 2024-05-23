import zonesRepo from "../repos/zoneRepo.js";
import nodeRepo from "../repos/nodeRepo.js";
import sensorRepo from "../repos/sensorRepo.js";

const getAllZones = async (greenhouseId) => {
  let zones = await zonesRepo.getAllByParentId(greenhouseId);

  if (zones) {
    zones = zones.map((zone) => {
      const x_length = zone.x_length;
      const y_length = zone.y_length;
      const z_length = zone.z_length;
      delete zone.x_length;
      delete zone.y_length;
      delete zone.z_length;

      const dimensions = {
        x: x_length,
        y: y_length,
        z: z_length,
      };
      return { ...zone, dimensions };
    });
  }
  return zones || null;
};

const getZoneById = async (greenhouseId, zoneId) => {
  let zone = await zonesRepo.getById(greenhouseId, zoneId);
  const x_length = zone.x_length;
  const y_length = zone.y_length;
  const z_length = zone.z_length;
  delete zone.x_length;
  delete zone.y_length;
  delete zone.z_length;

  const dimensions = {
    x: x_length,
    y: y_length,
    z: z_length,
  };

  let nodes = await nodeRepo.getAllZoneNodeInfo(zoneId);

  if (nodes) {
    nodes = nodes.map((node) => {
      if (node.zrp_x_pos) {
        return {
          node_id: node.node_id,
          controller_id: node.controller_id,
          module_id: node.module_id,
          location: nodes.location,
          square_id: node.square_id,
          zn_rel_pos: {
            x: node.zrp_x_pos,
            y: node.zrp_y_pos,
            z: node.zrp_z_pos,
          },
        };
      } else {
        return {
          node_id: node.node_id,
          controller_id: node.controller_id,
          module_id: node.module_id,
          location: nodes.location,
          square_id: node.square_id,
          square_pos: {
            x: node.s_x_pos,
            y: node.s_y_pos,
          },
        };
      }
    });
  }
  let sensors = await sensorRepo.getAllZoneSensorInfo(zoneId);
  if (sensors) {
    zone = { ...zone, sensorsAvailable: true };
    sensors = sensors.map((sensor) => {
      if (sensor.zrp_x_pos) {
        return {
          sensor_id: sensor.sensor_id,
          module_id: sensor.module_id,
          local_id: sensor.local_sensor_id,
          location: sensor.location,
          type: sensor.type,
          square_id: sensor.square_id,
          zn_rel_pos: {
            x: sensor.zrp_x_pos,
            y: sensor.zrp_y_pos,
            z: sensor.zrp_z_pos,
          },
        };
      } else {
        zone = { ...zone, sensorsAvailable: false };
        return {
          sensor_id: sensor.sensor_id,
          module_id: sensor.module_id,
          local_id: sensor.local_sensor_id,
          location: sensor.location,
          type: sensor.type,
          square_id: sensor.square_id,
          square_pos: {
            x: sensor.s_x_pos,
            y: sensor.s_y_pos,
          },
        };
      }
    });
  }
  return { ...zone, dimensions, nodes, sensors } || null;
};

export default {
  getAllZones,
  getZoneById,
};
