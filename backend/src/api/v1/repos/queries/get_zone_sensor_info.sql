select
    s.sensor_id,
    s.local_sensor_id,
    s.location,
    m.identifier as module_id,
    st.type_name,

    CASE
        WHEN s.square_id IS NOT NULL THEN s.square_id
        ELSE NULL
    END AS square_id,
    CASE
        WHEN s.square_id IS NOT NULL THEN sq.x_pos
        ELSE NULL
    END AS s_x_pos,
    CASE
        WHEN s.square_id IS NOT NULL THEN sq.y_pos
        ELSE NULL
    END AS s_y_pos,
    -- Return zone-relative coordinates if it has them
    CASE
        WHEN s.zn_rel_pos_id IS NOT NULL THEN zrp.x_pos
        else null
    end AS zrp_x_pos,
    CASE
        WHEN s.zn_rel_pos_id IS NOT NULL THEN zrp.y_pos
        else null
    end AS zrp_y_pos,
    CASE
        WHEN s.zn_rel_pos_id IS NOT NULL THEN zrp.z_pos
        else null
    end AS zrp_z_pos
from sensors s

left join modules m
    on s.module_id = m.module_id
join sensor_types st
    on s.type_id = st.type_id
 LEFT JOIN zn_rel_pos zrp ON m.zn_rel_pos_id = zrp.zn_rel_pos_id
 LEFT JOIN squares sq ON s.square_id = sq.square_id
where m.zone_id=$1
order by s.local_sensor_id asc;