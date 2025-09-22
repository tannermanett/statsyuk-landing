SELECT *
FROM "player_stats_overview" 
WHERE "Situation" IS NOT NULL AND "Season" = $1
ORDER BY "Points" DESC
