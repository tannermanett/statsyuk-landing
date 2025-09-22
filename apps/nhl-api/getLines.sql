WITH target_player AS (
    SELECT "team", "unit_index", "position", "headshot", "updated_at"
    FROM "v_team_lines"
    WHERE "player" = $1 AND "unit_type" = 'even_strength'
)
SELECT 
    p."player",
    p."position",
    p."unit_type",
    p."unit_index",
    p."headshot",
    p."updated_at",
    CASE 
        WHEN p."player" = $1 THEN 'self'
        ELSE 'linemate'
    END AS role
FROM "v_team_lines" p
JOIN target_player t ON p."team" = t."team"
WHERE 
    (p."unit_type" = 'even_strength' AND p."unit_index" = t."unit_index")
    OR (p."unit_type" = 'powerplay' AND p."player" = $1)
    OR (p."unit_type" = 'penalty_kill' AND p."player" = $1)

UNION

SELECT 
    "player",
    "position",
    "unit_type",
    "unit_index",
    "headshot",
    "updated_at",
    'injured' as role
FROM "v_team_lines"
WHERE "unit_type" = 'injuries' AND "player" = $1;
