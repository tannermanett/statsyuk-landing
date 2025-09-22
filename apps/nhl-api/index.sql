-- 1. Index on player_game_logs for (seasonId, playerId)
CREATE INDEX IF NOT EXISTS idx_player_game_logs_seasonId_playerId
    ON "player_game_logs" ("seasonId", "playerId");

-- 2. Index on skater_stats for (season, situation, playerId)
CREATE INDEX IF NOT EXISTS idx_skater_stats_season_situation_playerId
    ON "skater_stats" ("season", "situation", "playerId");

-- 3. Index on salary_data for (PlayerID, Year)
CREATE INDEX IF NOT EXISTS idx_salary_data_playerID_year
    ON "salary_data" ("PlayerID", "Year");

-- 4. Index on general_player_data(playerId) for efficient joins
CREATE INDEX IF NOT EXISTS idx_general_player_data_playerId
    ON "general_player_data" ("playerId");

-- 5. Index on teams(nhl_team_id) for efficient joins
CREATE INDEX IF NOT EXISTS idx_teams_nhl_team_id
    ON "teams" ("nhl_team_id");

-- Recommended New Index:

-- 6. Index on team_rosters for (playerId, season DESC)
CREATE INDEX IF NOT EXISTS idx_team_rosters_playerId_season_desc
    ON "team_rosters" ("playerId", "season" DESC);