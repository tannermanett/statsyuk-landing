SELECT 
    c.table_schema,
    c.table_name,
    json_object_agg(c.column_name, c.data_type ORDER BY c.ordinal_position) AS columns
FROM 
    information_schema.columns c
JOIN 
    information_schema.tables t 
    ON c.table_schema = t.table_schema AND c.table_name = t.table_name
WHERE 
    t.table_type = 'BASE TABLE'
    AND c.table_schema NOT IN ('information_schema', 'pg_catalog')
    AND c.table_name NOT IN ('expanded_play_by_play','play_by_play','flags','lines_stats',
    'prospects','team_lines','team_rosters','teams','weekly_schedules','current_standings')
GROUP BY 
    c.table_schema, c.table_name
ORDER BY 
    c.table_schema, c.table_name;