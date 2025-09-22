const { Pool } = require('pg');
const express = require('express');
const path = require('path');
const fs =require('fs');
const axios = require('axios');
const knex = require('knex');

const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});

let tableConfig = {};

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001; // changed to avoid conflict with Next.js

const cors = require('cors');
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


const url = process.env.DATABASE_URL;
const corPassword = process.env.QUERYPASSWORD;

const seasonRestrictedTables = {
    'standings': 'date',
    'games': 'season',
    'goalie_game_logs': 'seasonId',
    'goalie_stats': 'season',
    'player_game_logs': 'seasonId',
    'salary_data': 'Year',
    'skater_stats': 'season',
    'goal_visualizer': 'game_id'
};

const SEASON_CONFIG = {
    'standings': '2025-03-15',
    'games': '20242025',
    'goalie_game_logs': '20242025',
    'goalie_stats': '2024',
    'player_game_logs': '20242025',
    'salary_data': '2024',
    'skater_stats': '2024',
    'goal_visualizer': '2024010001'
};

//neon database details
const neonPool = new Pool({
    connectionString: url,
});

process.on('SIGINT', () => {
    neonPool.end(() => {
        console.log('Pool has ended');
        process.exit(0);
    });
});


//serve the html file as root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const getSidebarQuery = fs.readFileSync(path.join(__dirname, 'getSidebar.sql'), 'utf8');
const getRecentGamesQuery = fs.readFileSync(path.join(__dirname, 'last5games.sql'), 'utf8');
const getPlayerQuery = fs.readFileSync(path.join(__dirname, 'getPlayers.sql'), 'utf8');
const getGoalieQuery = fs.readFileSync(path.join(__dirname, 'getGoalies.sql'), 'utf8');
const getShotQuery = fs.readFileSync(path.join(__dirname, 'getShotData.sql'), 'utf8');
const getLineQuery = fs.readFileSync(path.join(__dirname, 'getLines.sql'), 'utf8');
const getSalaryQuery = fs.readFileSync(path.join(__dirname, 'getSalary.sql'), 'utf8');
const getStandingsQuery = fs.readFileSync(path.join(__dirname, 'getStandings.sql'), 'utf8');
const getTableSchema = fs.readFileSync(path.join(__dirname, 'getSchema.sql'), 'utf8');


async function initializeTableConfig(){
    try{
        const result = await neonPool.query(getTableSchema);
        tableConfig = result.rows.reduce((config,row) => {
            if(row.table_schema === 'public'){
                config[row.table_name] = {
                    name: row.table_name,
                    columns: Object.keys(row.columns),
                    columnTypes: row.columns
                };
            }
            return config;
        },{});
        return tableConfig;
    } catch (err) {
        console.error('Error fetching table schema:', err.stack);
        throw err;
    }
}

// Utility function to handle query execution
const executeQuery = async (res, query, params = [], errorMessage) => {
    try {
        const result = await neonPool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(`Error executing query: ${errorMessage}`, err.stack);
        res.status(500).send(errorMessage);
    }
};

// Route to get player info
app.get('/players', async (req, res) => {
    const season = req.query.season;
    if (!season) {
        return res.status(400).send('Season is required');
    }

    await executeQuery(res, getPlayerQuery, [season], 'Error fetching player data');
});

// Route to get goalie info
app.get('/goalies', async (req, res) => {
    const Season = req.query.Season;
    if (!Season) {
        return res.status(400).send('Season is required');
    }
    await executeQuery(res, getGoalieQuery, [Season], 'Error fetching goalie data');
});

// Route to get sidebar info
app.get('/sidebar', async (req, res) => {
    const playerName = req.query.playerName;
    const season = req.query.season;
    
    if (!playerName) {
        return res.status(400).send('Player name is required');
    }

    await executeQuery(res, getSidebarQuery, [playerName, season], 'Server error fetching sidebar data');
});

// Route to get recent games
app.get('/recentGames', async (req, res) => {
    const playerName = req.query.playerName;
    if (!playerName) {
        return res.status(400).send('Player name is required');
    }

    await executeQuery(res, getRecentGamesQuery, [playerName], 'Server error fetching recent games data');
});

// Route to get shot data
app.get('/shots', async (req, res) => {
    const playerName = req.query.playerName;
    if (!playerName) {
        return res.status(400).send('Player name is required');
    }

    await executeQuery(res, getShotQuery, [playerName], 'Server error fetching shot data');
});

app.get('/lines', async (req, res) => {
    const playerName = req.query.playerName;
    if (!playerName) {
        return res.status(400).send('Player name is required');
    }

    try {
        await executeQuery(res, getLineQuery, [playerName], 'Server error fetching line data');
    } catch (err) {
        console.error(`Error fetching line data for player ${playerName}:`, err.stack);
        res.status(500).send('Server error fetching line data');
    }
});

app.get('/salary', async (req, res) => {
    const playerName = req.query.playerName;
    if (!playerName) {
        return res.status(400).send('Player name is required');
    }

    try {
        await executeQuery(res, getSalaryQuery, [playerName], 'Server error fetching salary data');
    } catch (err) {
        console.error(`Error fetching salary data for player ${playerName}:`, err.stack);
        res.status(500).send('Server error fetching salary data');
    }
});

app.get('/standings', async (req, res) => {
    try {
        await executeQuery(res, getStandingsQuery, [], 'Server error fetching standings data');
    } catch (err) {
        console.error('Error fetching standings data:', err.stack);
        res.status(500).send('Server error fetching standings data');
    }
});


app.get('/api/tableConfig', async (req,res) => {
    res.json(tableConfig);
});

app.post('/api/verify-password',(req,res)=>{
    const {password} = req.body;
    if(password === corPassword){
        res.json({success:true});
    }else{
        res.json({success:false});
    }
});

app.post('/api', apiLimiter, async (req, res) => {
    const {table, columns, filters} = req.body;
    console.log("Request from sever",req.body);

    try{
    // Validation checks
    if (!table || !Object.keys(tableConfig).includes(table)) {
        return res.status(400).json({
            error: 'Invalid table name'
        });
    }

    if (!Array.isArray(columns) || columns.length === 0) {
        return res.status(400).json({
            error: 'Columns must be a non-empty array'
         });
    }

    
    const query = knex({client: 'pg'})
        .select(columns)
        .from(table);
    
    console.log("Query: ",query.toString());

    if (filters && filters.length > 0) {
        for (const filter of filters) {
            const columnType = tableConfig[table].columnTypes[filter.column];
            const value = filter.value;

            // Skip type checking for NULL operations
            if (['IS NULL', 'IS NOT NULL'].includes(filter.operator)) {
                continue;
            }

            // Type validation based on column type
            if (columnType === 'integer' && isNaN(parseInt(value))) {
                return res.status(400).json({
                    error: `Invalid value for column "${filter.column}". Expected integer, got "${value}"`
                });
            } else if (columnType === 'numeric' && isNaN(parseFloat(value))) {
                return res.status(400).json({
                    error: `Invalid value for column "${filter.column}". Expected number, got "${value}"`
                });
            } else if (columnType === 'date' && isNaN(Date.parse(value))) {
                return res.status(400).json({
                    error: `Invalid value for column "${filter.column}". Expected date format, got "${value}"`
                });
            }
        }

        console.log("\nApplying filters...");
        query.where(function(){
            filters.forEach((condition,index) => {
                let method;
                if(index === 0 || condition.logicalOperator === 'WHERE'){
                    method = 'where';
                } else if(condition.logicalOperator === 'AND'){
                    method = 'andWhere';
                } else if(condition.logicalOperator === 'OR'){
                    method = 'orWhere';
                }

                switch(condition.operator){
                    case 'IN':
                        this[method](condition.column, 'IN', Array.isArray(condition.value) ? 
                            condition.value : condition.value.split(',').map(v => v.trim()));
                        break;
                    case 'LIKE':
                        this[method](condition.column, 'ILIKE', condition.value);
                        break;
                    case 'IS NULL':
                        this[method](condition.column, 'IS', null);
                        break;
                    case 'IS NOT NULL':
                        this[method](condition.column, 'IS NOT', null);
                        break;
                    default:
                        this[method](condition.column, condition.operator, condition.value);
                }

            });
        });
    }

    if(seasonRestrictedTables[table]){
        const seasonColumn = seasonRestrictedTables[table];
        query.where(seasonColumn,'=', SEASON_CONFIG[table]);
    }


        console.log("Final Query",query.toString());
        const result = await neonPool.query(query.toString());
        res.json(result.rows);
    }catch(err){
        console.error('Error executing query:', err);
        res.status(500).json({error: `${err.message}`});
    }
});

// Start the server
app.listen(port,async () => {
    await initializeTableConfig();
    console.log(`Server running on http://localhost:${port}`);
});