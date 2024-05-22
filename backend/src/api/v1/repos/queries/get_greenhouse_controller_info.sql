--get controller info for greenhouse repo getControllers
SELECT
    m.identifier as moduleId,
    m.location,
    -- Return square info if it's not null
    CASE WHEN m.square_id IS NOT NULL THEN m.square_id ELSE NULL END AS square_id,
    CASE WHEN m.square_id IS NOT NULL THEN s.x_pos ELSE NULL END AS s_x_pos,
    CASE WHEN m.square_id IS NOT NULL THEN s.y_pos ELSE NULL END AS s_y_pos,
    -- Return zone-relative coordinates if it has them
    CASE WHEN m.zn_rel_pos_id IS NOT NULL THEN zrp.x_pos else null end  AS zrp_x_pos,
    CASE WHEN m.zn_rel_pos_id IS NOT NULL THEN zrp.y_pos else null end  AS zrp_y_pos,
    CASE WHEN m.zn_rel_pos_id IS NOT NULL THEN zrp.z_pos else null end  AS zrp_z_pos,
    z.zone_number
FROM controllers c
LEFT JOIN modules m ON m.module_id = c.controller_id
LEFT JOIN zn_rel_pos zrp ON m.zn_rel_pos_id = zrp.zn_rel_pos_id
LEFT JOIN zones z ON m.zone_id = z.zone_id
LEFT JOIN squares s ON m.square_id = s.square_id
where m.greenhouse_id = $1;
