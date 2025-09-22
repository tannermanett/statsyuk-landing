SELECT *
FROM 
    "goalie_stats_overview"
WHERE "Season" = $1
ORDER BY 
"OverallSavePct" DESC