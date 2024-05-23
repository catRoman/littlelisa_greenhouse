--get controller info for greenhouse repo getControllers
SELECT n.node_id,
n.controller_id,
    m.identifier as module_id,
    m.location,

    -- Return square info if it's not null
    CASE
        WHEN m.square_id IS NOT NULL THEN m.square_id
        ELSE NULL
    END AS square_id,
    CASE
        WHEN m.square_id IS NOT NULL THEN s.x_pos
        ELSE NULL
    END AS s_x_pos,
    CASE
        WHEN m.square_id IS NOT NULL THEN s.y_pos
        ELSE NULL
    END AS s_y_pos,
    -- Return zone-relative coordinates if it has them
    CASE
        WHEN m.zn_rel_pos_id IS NOT NULL THEN zrp.x_pos
        else null
    end AS zrp_x_pos,
    CASE
        WHEN m.zn_rel_pos_id IS NOT NULL THEN zrp.y_pos
        else null
    end AS zrp_y_pos,
    CASE
        WHEN m.zn_rel_pos_id IS NOT NULL THEN zrp.z_pos
        else null
    end AS zrp_z_pos
FROM nodes n
    LEFT JOIN modules m ON m.module_id = n.node_id
    left join controllers c on n.controller_id = m.module_id
    LEFT JOIN zn_rel_pos zrp ON m.zn_rel_pos_id = zrp.zn_rel_pos_id
    LEFT JOIN zones z ON m.zone_id = z.zone_id
    LEFT JOIN squares s ON m.square_id = s.square_id
where
 z.zone_id = $1
 order by n.node_id asc;