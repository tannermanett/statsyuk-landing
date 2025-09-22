document.addEventListener("click", (e) => {
  const isDropButton = e.target.matches("[data-dropdown-button]");

  if (!isDropButton) return;

  // Find the closest parent .dropdown element
  const clickedDropdown = e.target.closest(".dropdown");

  if (clickedDropdown) {
    clickedDropdown.classList.toggle("show");
  }
});

function formatDate(date, includeYear = true) {
  const options = { month: "short", day: "numeric" };
  if (includeYear) options.year = "numeric";

  const day = date.getUTCDate();
  const suffix =
    (day % 10 === 1 && day !== 11) ? "st" :
    (day % 10 === 2 && day !== 12) ? "nd" :
    (day % 10 === 3 && day !== 13) ? "rd" : "th";

  let formattedDate = date.toLocaleDateString("en-US", options);
  formattedDate = formattedDate.replace(/\b\d{1,2}\b/, day + suffix);

  return formattedDate;
}

function formatTime(timestamp) {
  if (!timestamp) {
    return "Invalid timestamp";
  }
  const date = new Date(timestamp);
  if (isNaN(date)) {
    return "Invalid timestamp";
  }

  let hours = date.getUTCHours(); // Use getHours() if you want local time
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12; // Convert to 12-hour format

  return `${hours12}:${minutes}:${seconds} ${period}`;
}




function loadContent(sectionId, fileName) {
  fetch(fileName)
      .then(response => response.text())
      .then(data => {
          const section = document.getElementById(sectionId);
          if (section) {
              section.innerHTML = data;  // Insert the HTML content
              section.hidden = false;    // Make the section visible
          } else {
              console.error(`Section with id ${sectionId} not found.`);
          }
      })
      .catch(error => console.error('Error loading the content: ', error));
}



///////////VARIABLES////////////////////
let playersData = [];
let filteredPlayersData = [];

let searchValueGeneral = "";
let searchValueAdvanced = "";
let searchValueGoalies = "";

let goalieData = [];
let filteredGoalieData = [];

let standingsData = [];
let filteredStandingsData = [];

const sortDirections = {};
let lastSortedColumn = null;

let isGradientEnabled = false;


////////////////////////FETCHES////////////////////////
// Fetch player data
function fetchPlayers() {
  if (playersData.length > 0) {
    playersData.forEach((player, index) =>{
      player.rank = index + 1;
    });
    applyFilters();
    return;
  }
  const seasonValue = Number(document.getElementById("season-filter-players").value);
  fetch(`/players?season=${encodeURIComponent(seasonValue)}`)
    .then((response) => response.json())
    .then((players) => {
      playersData = players;
      applyFilters();
    })
    .catch((error) => {
      console.error("Error fetching players:", error);
    });
}

function fetchGoalies() {
  if (goalieData.length > 0) {
    goalieData.forEach((goalie, index) => {
      goalie.rank = index + 1;
    });
    applyFilters();
    return;
  }
  const seasonValue = Number(document.getElementById("season-filter-goalies").value);
  fetch(`/goalies?Season=${encodeURIComponent(seasonValue)}`)
    .then((response) => response.json())
    .then((goalies) => {
      goalieData = goalies.map((goalie, index) => {
        goalie.xGAA = (goalie.ExpectedGoalsAgainst / goalie.GamesPlayed).toFixed(2);
        return goalie;
      });
      applyFilters();
    })
    .catch((error) => {
      console.error("Error fetching goalies:", error);
    });
}

function fetchSidebar() {
  fetch("/sidebar")
    .then((response) => response.json())
    .then((sidebar) => {
      sidebarData = sidebar;
    })
    .catch((error) => {
      console.error("Error fetching sidebar:", error);
    });
}

function fetchStandings(){
  fetch('/standings')
    .then(response => response.json())
    .then(data => {
      console.log(data);

      standingsData = data.map((team, index) => {
        console.log(groupTeams(data, "division"));
        team.homeRecord = `${team.homeWins}-${team.homeLosses}-${team.homeOtLosses}`;
        team.awayRecord = `${team.roadWins}-${team.roadLosses}-${team.roadOtLosses}`;
        team.lastTen = `${team.l10Wins}-${team.l10Losses}-${team.l10OtLosses}`;
        team.streak = `${team.streakCode}${team.streakCount}`;
        team.rank = index + 1;
        return team;
      });
      if(window.updateStandingsChart){
        window.updateStandingsChart(standingsData);
      }
    })
    .catch(error => {
      console.error('Error fetching standings:', error);
    });


}

////////////////////////RENDERING////////////////////////
const TableTypes = {
  PlayersGeneral: "PlayersGeneral",
  PlayersAdvanced: "PlayersAdvanced",
  Goalies: "Goalies",
  Standings: "Standings",
};

function createTableFragment(data, rowTemplate) {
  const fragment = document.createDocumentFragment();
  data.forEach((item) => {
    const row = document.createElement("tr");
    const id = item.teamName || item.PlayerName 
    row.setAttribute("data-player", id);
    row.innerHTML = rowTemplate(item);
    fragment.appendChild(row);
  });
  return fragment;
}

function renderTable(data, tableType) { 
  switch (tableType) {
    case TableTypes.PlayersGeneral:
      renderPlayersGeneralTable(data);
      break;
    case TableTypes.PlayersAdvanced:
      renderPlayersAdvancedTable(data);
      break;
    case TableTypes.Goalies:
      renderGoalieTable(data);
      break;
    case TableTypes.Standings:
      renderStandingsTable(data);
      break;
    default:
      console.error(`Invalid table type: ${tableType}`);
  }
}



function renderPlayersGeneralTable(data) {
  const tbody = document.querySelector("#PlayersGeneral_stats");
  if (!tbody) {
    console.error("Table body element not found for players general");
    return;
  }
  tbody.innerHTML = ""; // Clear existing rows

  const fragment = createTableFragment(data, (player) => {

    const teamLogo = player.TeamImage
      ? `<img src="${player.TeamImage}" alt="${player.Team} logo" class="team-logo">`
      : "";

    const roundedVal = {};
    Object.keys(columnMeta).forEach((columnName) => {
      const { value } = getValueAndType(player, columnName);        
      roundedVal[columnName] = value;
    });

    return `
      <td class="sticky-col" id="first-col">${player.rank}</td>
      <td class="sticky-col" id="second-col">
          <div class = "flex-box">
            <span class="white">${
              " #" + player.JerseyNumber + " "
            }</span><span class="light-blue">${player.PlayerName}</span>${teamLogo}
          </div>
      </td>
      <td>${player.Position}</td>
      <td>${player.GP}</td>
      <td>${player.Points}</td>
      <td>${player.Goals}</td>
      <td>${player.GWG}</td>
      <td>${player.OTGoals}</td>
      <td>${player.TotalAssists}</td>
      <td>${player.PrimaryAssists}</td>
      <td>${player.SecondaryAssists}</td>
      <td>${player.PM}</td>
      <td>${roundedVal.Avg_TOI}</td>
      <td>${roundedVal.AvgShifts}</td>
      <td>${player.ShotsOnGoal}</td>
      <td>${player.ShotAttempts}</td>
      <td>${roundedVal.ShootingPerc}</td>
      <td>${roundedVal.Faceoff}</td>
      <td>${player.PenaltyMinutes}</td>
      <td>${player.PIMsDrawn}</td>
      <td>${player.Hits}</td>
      <td>${player.Takeaways}</td>
      <td>${player.Giveaways}</td>
      <td>${player.BlockedShots}</td>
      <td>${player.AAV}</td>
      <td class="hidden">${player.Situation}</td>    
    `;
  });
  tbody.appendChild(fragment);

  gradientColumn();
}

function renderGoalieTable(data) {
  const tbody = document.querySelector("#Goalies_stats");
  if (!tbody) {
    console.error("Table body element not found for goalies");
    return;
  }

  let rank = 0;
  tbody.innerHTML = ""; 
  const fragment = createTableFragment(data, (goalie) => {
    rank++;
    const teamLogo = goalie.TeamImage
      ? `<img src="${goalie.TeamImage}" alt="${goalie.Team} logo" class="team-logo">`
      : "";

    
    return `
      <td class="sticky-col" id="first-col">${rank}</td>
      <td class="sticky-col" id="second-col">
          <div class = "flex-box">
            <span class="white">${
              " #" + goalie.JerseyNumber + " "
            }</span><span class="light-blue">${goalie.GoalieName}</span>${teamLogo}
          </div>
      </td>
      <td>${goalie.GamesPlayed}</td>
      <td>${goalie.Wins}</td>
      <td>${goalie.Losses}</td>
      <td>${goalie.Shutouts}</td>
      <td>${goalie.GoalsAgainst}</td>
      <td>${goalie.ShotsOnGoal}</td>
      <td>${goalie.OverallSavePct}</td>
      <td>${goalie.GoalsAgainstAverage}</td>
      <td>${goalie.xGAA}</td>
      <td>${goalie.Rebounds}</td>
      <td>${goalie.ReboundsPerSave}</td>
      <td>${goalie.LowDangerSavePct}</td>
      <td>${goalie.MediumDangerSavePct}</td>
      <td>${goalie.HighDangerSavePct}</td>

    `;
  });
  tbody.appendChild(fragment);
  gradientColumn();
}

function renderStandingsTable(data) {
  const container = document.querySelector("#Standings_stats");
  if(!container) {
    console.error("Table body element not found for standings");
    return;
  }

  const groupBy = document.getElementById("group-filter-standings").value;
  container.innerHTML = "";
  const mainHeader = document.querySelector("#Standings thead");

  data.forEach(team => {
    team.againstPerGame = (team.goalAgainst / team.gamesPlayed).toFixed(2);
  });

  if(groupBy === "none") {
    // Create single tbody for ungrouped view
    mainHeader.style.display = "";
    renderStandingsGrouped(data, container);
  } else {
    // Group teams and create separate tbodies
    const groups = groupTeams(data, groupBy);
    mainHeader.style.display = "none";
    
    Object.entries(groups).forEach(([groupKey, groupData]) => {
      const groupHeader = document.createElement("h2");
      groupHeader.classList.add("group-header");
      groupHeader.textContent = groupKey;
      groupHeader.style.position = "relative";
      groupHeader.style.left = "0";
      groupHeader.style.zIndex = "5";
      groupHeader.style.padding = "1rem 0";
      container.appendChild(groupHeader);

      const table = document.createElement("table");
      const thead = document.createElement("thead");
      thead.innerHTML = `
        <tr>
          <th class="sticky-col" id="first-col" style="z-index:6" data-column="rank">#</th>
          <th class="sticky-col" id="second-col" style="z-index:6" data-column="teamName">Team</th>
          <th data-column="gamesPlayed">GP</th>
          <th data-column="wins">W</th>
          <th data-column="losses">L</th>
          <th data-column="otLosses">OTL</th>
          <th data-column="points">PTS</th>
          <th data-column="homeRecord">Home</th>
          <th data-column="awayRecord">Away</th>
          <th data-column="pointPctg">Points %</th>
          <th data-column="goalFor">GF</th>
          <th data-column="goalAgainst">GA</th>
          <th data-column="goalDifferential">Differential</th>
          <th data-column="goalsForPctg">GF/Game</th>
          <th data-column="againstPerGame">GA/Game</th>
          <th data-column="goalDifferentialPctg">Differential/Game</th>
          <th data-column="lastTen">Last 10</th>
          <th data-column="streak">Streak</th>
        </tr>
      `;
      table.appendChild(thead);

      // Create tbody and render data
      const tbody = document.createElement("tbody");
      renderStandingsGrouped(groupData, tbody);
      table.appendChild(tbody);

      container.appendChild(table);

      // Add spacing between tables
      if (Object.keys(groups).length > 1) {
        const spacer = document.createElement("div");
        spacer.style.height = "2rem";
        container.appendChild(spacer);
      }
    });
  }

  gradientColumn();
}

function renderStandingsGrouped(teams,tbody){
  const fragment = createTableFragment(teams, (team) => {
    const roundedVal = {};
    Object.keys(standingsColumnMeta).forEach((columnName) => {
      const { value } = getValueAndType(team, columnName);        
      roundedVal[columnName] = value;
    });

    const logo = team.teamLogo
      ? `<img src="${team.teamLogo}" alt="${team.Team} logo" class="team-logo">`
      : "";

      return`
      <td class="sticky-col" id="first-col">${team.rank}</td>
      <td class="sticky-col" id="second-col">
          <div class = "flex-box">
            <span class="light-blue
            ">${team.teamName}</span>${logo}
          </div>
      </td>
      <td>${team.gamesPlayed}</td>
      <td>${team.wins}</td>
      <td>${team.losses}</td>
      <td>${team.otLosses}</td>
      <td>${team.points}</td>
      <td>${team.homeRecord}</td>
      <td>${team.awayRecord}</td>
      <td>${roundedVal.pointPctg}</td>
      <td>${team.goalFor}</td>
      <td>${team.goalAgainst}</td>
      <td>${team.goalDifferential}</td>
      <td>${roundedVal.goalsForPctg}</td>
      <td>${team.againstPerGame}</td>
      <td>${roundedVal.goalDifferentialPctg}</td>
      <td>${team.lastTen}</td>
      <td>${team.streak}</td>
    `;

  });
  tbody.appendChild(fragment);
}


function groupTeams(teams, groupBy){
  const groups = {};
  console.log(teams);
  console.log(groupBy);

  teams.forEach(team =>{
    const groupKey = groupBy === "conference" ? team.conferenceName : team.divisionName;

    if(!groups[groupKey]){
      groups[groupKey] = [];
    }
    groups[groupKey].push(team);
  });

  Object.values(groups).forEach(group => {
    group.sort((a,b) => b.points - a.points);
    group.forEach((team, index) => {
      team.rank = index + 1;
    });
  });
  return groups;
}


function determineVisibleTable() {
  const tables = ['PlayersGeneral', 'PlayersAdvanced', 'Goalies', 'Standings'];
  return tables.find(table => !document.getElementById(table).hidden) || '';
}

////////////////////////SORTING////////////////////////

const columnMeta = {
  Rank: { type: "number", transform: (value) => parseInt(value, 10) },
  PlayerName: { type: "string" },
  GP: { type: "number", transform: (value) => parseInt(value, 10) },
  Position: { type: "string" },
  Points: { type: "number", transform: (value) => parseInt(value, 10) },
  Goals: { type: "number", transform: (value) => parseInt(value, 10) },
  GWG: { type: "number", transform: (value) => parseInt(value, 10) },
  OTGoals: { type: "number", transform: (value) => parseInt(value, 10) },
  TotalAssists: { type: "number", transform: (value) => parseInt(value, 10) },
  PrimaryAssists: { type: "number", transform: (value) => parseInt(value, 10) },
  SecondaryAssists: {
    type: "number",
    transform: (value) => parseInt(value, 10),
  },
  PM: { type: "number", transform: (value) => parseInt(value, 10) },
  Avg_TOI: {
    type: "number",
    transform: (value) => (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
    format: (value) => {
      const minutes = Math.floor(value);
      const seconds = Math.round((value - minutes) * 60);

      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    },
  },
  AvgShifts: {
    type: "number",
    transform: (value) => parseFloat(value),
    format: (value) => parseFloat(value).toFixed(2),
  },
  ShotsOnGoal: { type: "number", transform: (value) => parseInt(value, 10) },
  ShotAttempts: { type: "number", transform: (value) => parseInt(value, 10) },
  ShootingPerc: {
    type: "number",
    transform: (value) => parseFloat(value),
    format: (value) => parseFloat(value).toFixed(2),
  },
  Faceoff: {
    type: "number",
    transform: (value) => (isNaN(parseFloat(value)) ? 0 : parseFloat(value)),
    format: (value) => parseFloat(value).toFixed(2),
  },
  PenaltyMinutes: { type: "number", transform: (value) => parseInt(value, 10) },
  PIMsDrawn: { type: "number", transform: (value) => parseInt(value, 10) },
  Hits: { type: "number", transform: (value) => parseInt(value, 10) },
  Takeaways: { type: "number", transform: (value) => parseInt(value, 10) },
  Giveaways: { type: "number", transform: (value) => parseInt(value, 10) },
  BlockedShots: { type: "number", transform: (value) => parseInt(value, 10) },
  AAV: {
    type: "number",
    transform: (value) => parseInt(value, 10),
  },
  Situation: { type: "string" },
}
const goalieColumnMeta = {
  rank: { type: "number", transform: (value) => parseInt(value, 10) },
  GoalieName: { type: "string" },
  GamesPlayed: { type: "number", transform: (value) => parseInt(value, 10) },
  Wins: { type: "number", transform: (value) => parseInt(value, 10) },
  Losses: { type: "number", transform: (value) => parseInt(value, 10) },
  Shutouts: { type: "number", transform: (value) => parseInt(value, 10) },
  GoalsAgainst: { type: "number", transform: (value) => parseInt(value, 10) },
  ShotsOnGoal: { type: "number", transform: (value) => parseInt(value, 10) },
  OverallSavePct: {
    type: "number",
    transform: (value) => parseFloat(value),
    format: (value) => parseFloat(value).toFixed(3),
  },
  GoalsAgainstAverage: { 
    type: "number", 
    transform: (value) => parseFloat(value),
    format: (value) => parseFloat(value).toFixed(2)
  },
  xGAA: { 
    type: "number", 
    transform: (value) => parseFloat(value),
    format: (value) => parseFloat(value).toFixed(2)
  },
  Rebounds: { type: "number", transform: (value) => parseInt(value, 10) },
  ReboundsPerSave: {
    type: "number",
    transform: (value) => parseFloat(value),
    format: (value) => parseFloat(value).toFixed(3)
  },
  LowDangerSavePct: {
    type: "number",
    transform: (value) => parseFloat(value),
    format: (value) => parseFloat(value).toFixed(3)
  },
  MediumDangerSavePct: {
    type: "number",
    transform: (value) => parseFloat(value),
    format: (value) => parseFloat(value).toFixed(3)
  },
  HighDangerSavePct: {
    type: "number",
    transform: (value) => parseFloat(value),
    format: (value) => parseFloat(value).toFixed(3)
  },
};

const standingsColumnMeta = {
  rank: { type: "number", transform: (value) => parseInt(value, 10) },
  teamName: { type: "string" },
  gamesPlayed: { type: "number", transform: (value) => parseInt(value, 10) },
  wins: { type: "number", transform: (value) => parseInt(value, 10) },
  losses: { type: "number", transform: (value) => parseInt(value, 10) },
  otLosses: { type: "number", transform: (value) => parseInt(value, 10) },
  points: { type: "number", transform: (value) => parseInt(value, 10) },
  homeRecord: { type: "string",
    transform: (value) => {
      const [wins, losses, otLosses] = value.split("-").map(Number);
      return (wins * 2) + otLosses;
    }
  },
  awayRecord: { type: "string",
    transform: (value) => {
      const [wins, losses, otLosses] = value.split("-").map(Number);
      return (wins * 2) + otLosses;
    }
   },
  pointPctg: { type: "number", transform: (value) => parseFloat(value), format: (value) => value.toFixed(3) },
  goalFor: { type: "number", transform: (value) => parseInt(value, 10) },
  goalAgainst: { type: "number", transform: (value) => parseInt(value, 10) },
  goalDifferential: { type: "number", transform: (value) => parseInt(value, 10) },
  goalsForPctg: { type: "number", transform: (value) => parseFloat(value), format: (value) => value.toFixed(2) },
  againstPerGame: { type: "number", transform: (value) => parseFloat(value) },
  goalDifferentialPctg: { type: "number", transform: (value) => parseFloat(value), format: (value) => value.toFixed(2) },
  lastTen: { type: "string",
    transform: (value) => {
      const [wins, losses, otLosses] = value.split("-").map(Number);
      return (wins * 2) + otLosses;
    }
  },
  streak: { type: "string",
    transform: (value) => {
      const code = value.slice(0, 1);
      if(code === 'O') return 0;
      const count = parseInt(value.slice(1), 10);
      return code === 'W'? count : -count;
    }
  },
};



const sortState = {
  PlayersGeneral: {
    column: "Points",
    ascending: false
  },
  PlayersAdvanced: {
    column: "",
    ascending: false
  },
  Goalies: {
    column: "Wins",
    ascending: false
  },
  Standings: {
    column: "points",
    ascending: false
  }
};


function sortData(data, column = null){
  const tableType = determineVisibleTable();
  if (!tableType) return;

  if (column) {
    if (sortState[tableType].column === column) {
      sortState[tableType].ascending = !sortState[tableType].ascending;
    } else {
      sortState[tableType].column = column;
      sortState[tableType].ascending = true;
    }
  }
  


  const meta = tableType === "Standings" ? standingsColumnMeta[sortState[tableType].column] : tableType === "Goalies" ? goalieColumnMeta[sortState[tableType].column] : columnMeta[sortState[tableType].column];
  
  if (!meta) {
    console.error(`Column metadata not found for ${sortState[tableType].column}`);
    return;
  }
  console.log(meta);

  data.sort((a, b) => {
    let aValue = a[sortState[tableType].column];
    let bValue = b[sortState[tableType].column];

    if (meta.type === "string" && !meta.transform) {
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortState[tableType].ascending ? comparison : -comparison;
    }else {
      aValue = meta.transform ? meta.transform(a[sortState[tableType].column]) : a[sortState[tableType].column];
      bValue = meta.transform ? meta.transform(b[sortState[tableType].column]) : b[sortState[tableType].column];
    }

    if (aValue < bValue) return sortState[tableType].ascending ? -1 : 1;
    if (aValue > bValue) return sortState[tableType].ascending ? 1 : -1;

    return a.rank - b.rank;
  });

  data.forEach((player, index) => {
    player.rank = index + 1;
  });
  return data;
}

function handleHeaderClick(columnIdex){
  const tableType = determineVisibleTable();
  if(!tableType) return;

  const headerRow = document.querySelector(`#${tableType} thead tr`);
  if(!headerRow) return;

  const columnName = headerRow.querySelectorAll("th")[columnIdex].getAttribute("data-column");
  if(!columnName) return;

  if(sortState[tableType].column === columnName){
    sortState[tableType].ascending = !sortState[tableType].ascending;
  }else{
    sortState[tableType].column = columnName;
    sortState[tableType].ascending = false;
  }

  updateHeaderArrows(columnIdex, sortState[tableType].ascending);
  applyFilters();
}

// Function to get the value and type of a player's data
function getValueAndType(player, columnName) {
  const meta = columnMeta[columnName] || standingsColumnMeta[columnName] || { type: "string" };

  let value = player[columnName] || "";

  let sortableValue = meta.transform ? meta.transform(value) : value;

  return {
    value: meta.format ? meta.format(sortableValue) : value,
    sortableValue,
    type: meta.type,
  };
}

// Function to update header arrows
function updateHeaderArrows(columnIndex, ascending) {
  const tableType = determineVisibleTable();
  if (!tableType) return;
  const headerRow = document.querySelector(`#${tableType} thead tr`);
  if (!headerRow) return;

  const arrows = headerRow.querySelectorAll(".sort-arrow");
  arrows.forEach((arrow, index) => {
    if (index === columnIndex) {
      arrow.textContent = ascending ? " ▲ " : " ▼";
    } else {
      arrow.textContent = "";
    }
  });
}

// Cache sections and links
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

// Function to hide all sections and remove active class from links
function resetSectionsAndLinks() {
  sections.forEach((section) => (section.hidden = true));
  document
    .querySelectorAll("nav ul li")
    .forEach((li) => li.classList.remove("active"));
}

// Event delegation for navigation links
document.querySelector("nav").addEventListener("click", (event) => {
  const isDropButton = event.target.matches("[data-dropdown-button]");
  if (event.target.classList.contains("nav-link") && !isDropButton) {
    event.preventDefault();
    resetSectionsAndLinks();

    const sectionId = event.target.getAttribute("href").slice(1);
    const section = document.getElementById(sectionId);
    
    // Load content for Home and About pages
    if (sectionId === "Home") {
      loadContent(sectionId, "home.html");
    } else if (sectionId === "PlayersGeneral") {
      section.hidden = false;
      applyFilters();
    }else if(sectionId === "PlayersAdvanced"){
      section.hidden = false;
    }else if(sectionId === "Goalies"){
      section.hidden = false;
      applyFilters();
    }else if(sectionId === "Standings"){
      section.hidden = false;
      applyFilters();
    }else if (sectionId === "About") {
      loadContent(sectionId, "about.html");
    }else if(sectionId === "Lines"){
      section.hidden = false;
    }else if(sectionId === "Queries"){
      section.hidden = false;
    }
    event.target.parentElement.classList.add("active");
  }
});

// Search functionality for pages
const searchInputs = {
  'search-players-general': 'searchValueGeneral',
  'search-players-advanced': 'searchValueAdvanced',
  'goalie-search': 'searchValueGoalies',
  'team-search' : 'searchValueStandings'
};

Object.entries(searchInputs).forEach(([id, valueVar]) => {
  document.getElementById(id)?.addEventListener("input", debounce(function () {
    window[valueVar] = this.value.toLowerCase();
    console.log(valueVar, this.value);
    applyFilters();
  }
  , 300));
});



// Initially hide all sections
resetSectionsAndLinks();
document.getElementById("Home").hidden = false;

function updateStickyColumnWidth() {
  const firstStickyCol = document.querySelector("#first-col");
  if (firstStickyCol) {
    const firstColWidth = firstStickyCol.offsetWidth;
    document.documentElement.style.setProperty(
      "--first-col-width",
      `${firstColWidth}px`
    );
  }
}

/**
 * Debounce function to limit the rate at which a function can fire.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - Delay in milliseconds.
 * @returns {Function}
 */
function debounce(func, delay) {
  let debounceTimer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}

function updateMenuButton() {
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.querySelector("nav");
  menuBtn.textContent = nav.classList.contains("minimized") ? "☰" : "×";

  menuBtn.addEventListener("click", () => {
    nav.classList.toggle("minimized");
    menuBtn.textContent = nav.classList.contains("minimized") ? "☰" : "×";
  });
}

document.querySelectorAll('.slider-box input[type="range"]').forEach((slider) => {
    slider.addEventListener("input", function () {
      const max = this.max || 100;
      const value = ((this.value - this.min) * 100) / (max - this.min);
      this.style.background = `linear-gradient(to right, rgb(155, 186, 242) 0%, rgb(155, 186, 242) ${value}%, white ${value}%, white 100%)`;
    });
  });

// Call the function on page load and on window resize
window.addEventListener("DOMContentLoaded", updateStickyColumnWidth);
window.addEventListener("resize", updateStickyColumnWidth);

document.addEventListener("DOMContentLoaded", function(){
  const passwordDiv = document.getElementById("password-section");
  const passwordInput = document.getElementById("password");
  const submitBtn = document.getElementById("submit");
  const queryBuilder = document.getElementById("query-builder");
  const messageDiv = document.getElementById("word-message");

  submitBtn.addEventListener('click',verifyPassword);
  passwordInput.addEventListener('keypress',function(e){
    if(e.key==='Enter'){
      e.preventDefault();
      verifyPassword();
    }
  })
  
  function verifyPassword() {
    const password = passwordInput.value;
    
    fetch('/api/verify-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            passwordDiv.style.display = 'none';
            queryBuilder.style.display = '';
        } else {
            passwordInput.value = '';
            messageDiv.textContent = "Incorrect password, please try again"
        }
    })
    .catch(error => {
        console.error('Error:', error);
        messageDiv.textContent = "An error occured, please try again"
    });
}

});


document.addEventListener("DOMContentLoaded", () => {
  const tables = ["PlayersGeneral", "PlayersAdvanced", "Goalies", "Standings"];
  tables.forEach((table) => {
    const headerRow = document.querySelector(`#${table} thead tr`);
    if(headerRow){
      headerRow.querySelectorAll("th").forEach((header, index) => { 
        if(header.classList.contains("hidden")) return;

        if(!header.querySelector(".sort-arrow")){
          const arrow = document.createElement("span");
          arrow.classList.add("sort-arrow");
          header.appendChild(arrow);
        }
        const columnName = header.getAttribute("data-column");
        header.addEventListener("click", () => handleHeaderClick(index));
      });
    }
  });
  //hide nav on mobile
  if (window.innerWidth <= 450) {
    document.querySelector("nav").classList.add("minimized");
  }

  // Initially hide all sections
  resetSectionsAndLinks();

  loadContent("Home", "home.html");
  document.getElementById("Home").hidden = false;

  // Fetch data for the initial load
  fetchPlayers();
  fetchGoalies();
  fetchStandings();

  // Add event listener for player name clicks
  document.querySelector("#PlayersGeneral_stats").addEventListener("click", (event) => {
      if (event.target.classList.contains("light-blue")) {
        const row = event.target.closest("tr");
        const rows = document.querySelectorAll("#PlayersGeneral_stats tr");
        currentSelectedIndex = Array.from(rows).indexOf(row);

        const playerName = event.target.textContent;
        const player = playersData.find((p) => p.PlayerName === playerName);
        if (player) {
          showPlayerSidebar(player);
        }
      }
    });

  // Initial check on load
  updateMenuButton();

  // Add event listener for closing the sidebar
  document.querySelector(".close-btn").addEventListener("click", () => {
    document.getElementById("player-sidebar").classList.remove("show");
    document.querySelectorAll('.player-highlight').forEach(row => {
      row.classList.remove('player-highlight');
    });
  });
});


function openGeneralPlayers() {
  resetSectionsAndLinks();
  document.getElementById("PlayersGeneral").hidden = false;
  document.querySelector("nav ul li:nth-child(2)").classList.add("active");

  if(playersData.length === 0){
    fetchPlayers();
  }else{
    applyFilters();
  }
}


const lastNameElement = document.getElementById("sidebar-last-name");

function adjustFontSize() {
  const containerWidth = lastNameElement.parentElement.offsetWidth;
  const textWidth = lastNameElement.scrollWidth;

  // If the text doesn't fit, set font-size to 1.2vw, else set to 1.5em
  if (textWidth > containerWidth) {
    lastNameElement.style.fontSize = `1.2vw`; // Shrink text
  } else {
    lastNameElement.style.fontSize = `1.5em`; // Normal size
  }

}

window.addEventListener("resize", adjustFontSize);

function splitName(name) {
  const parts = name.split(" ");
  const firstName = parts.slice(0, -1).join(" ");
  const firtLetter = firstName.charAt(0);
  const lastName = parts.slice(-1).join(" ");
  return firtLetter + ". " + lastName;
}


////////////////SIDEBAR DETAILS////////////////////////////////

function showPlayerSidebar(player) {
    let selectedSeason = document.getElementById("season-filter-players").value;

    const imagePromises = [
      loadImage(player.PlayerHeadshot),
      loadImage(player.flag_image),
      loadImage(player.TeamImage),
    ];

    // Helper function to preload images
    function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve; // Still resolve on error to prevent hanging
      img.src = src;
      });
    }

    const fetchPromises = [
      fetch(`/sidebar?playerName=${encodeURIComponent(player.PlayerName)}&season=${encodeURIComponent(selectedSeason)}`).then((response) => response.json()).then((data) => {
          if (data.length === 0) {
            console.log("No data returned for player.");
            return null; // Ensure this is handled properly if no data is returned
          }
          playerData = data[0];
          radarData = {
            position: player.Position,
            name: player.PlayerName,
            goals: player.Goals,
            assists: player.TotalAssists,
            points: player.Points,
            pm: player.PM,
            shots: playerData.total_shots_on_goal,
            Sperc: playerData.shooting_percentage,
            xGoals: playerData.total_xg,
            ozoneStarts: playerData.total_oZoneShiftStarts,
            dzoneStarts: playerData.total_dZoneShiftStarts,
            takeaways: playerData.total_takeaways,
            shotBlocks: playerData.total_shots_blocked_by_player,
            hits: player.Hits,
            primaryAssists: player.PrimaryAssists,
            secondaryAssists: player.SecondaryAssists,
            percentiles: {
              goals: playerData.total_goals_percentile,
              assists: playerData.total_assists_percentile,
              points: playerData.total_points_percentile,
              pm: playerData.plusminus_percentile,
              shots: playerData.total_shots_on_goal_percentile,
              Sperc: playerData.shooting_percentage_percentile,
              xGoals: playerData.total_xg_percentile,
              ozoneStarts: playerData.total_ozoneshiftstarts_percentile,
              dzoneStarts: playerData.total_dzoneshiftstarts_percentile,
              takeaways: playerData.total_takeaways_percentile,
              shotBlocks: playerData.total_shots_blocked_by_player_percentile,
              hits: playerData.total_hits_percentile,
            }, 
          };
        }).catch((error) => {console.error("Error fetching sidebar data:", error);}),
  
      fetch(`/recentGames?playerName=${encodeURIComponent(player.PlayerName)}`).then((response) => response.json()).then((data) => {
          if (data.length === 0) {
            console.log("No data returned for recent games.");
            return null; // Ensure this is handled properly if no data is returned
          }
          recentGamesData = data;
        }).catch((error) => {console.error("Error fetching recent games data:", error);}),
  
      fetch(`/shots?playerName=${encodeURIComponent(player.PlayerName)}`).then((response) => response.json()).then((data) => {
          if (data.length === 0) {
            console.log("No data returned for shots.");
            return null; // Ensure this is handled properly if no data is returned
          }
          shotsData = data;
        }).catch((error) => {console.error("Error fetching shots data:", error);}),
  
      fetch(`/lines?playerName=${encodeURIComponent(player.PlayerName)}`).then((response) => response.json()).then((data) => {
          if (data.length === 0) {
            console.log("No data returned for lines.");
            return null;
          }
          linesData = data;
  
          ppUnit = "N/A";
          pkUnit = "N/A";
  
          line = linesData[0].unit_index;

          updateTime = formatTime(linesData[0].updated_at);

          if(linesData[0].unit_type === "injuries"){
            timeline = linesData[0].position;
            if(timeline === "ir"){
              injStatus = "Injured Reserve";
            }
            else if(timeline === "dtd"){
              injStatus = "Day-to-Day";
            }
            else if(timeline === "out"){
              injStatus = "Out";
            }
          }else{
            for (let i = 0; i < linesData.length; i++) {
              if (linesData[i].unit_type === "powerplay") {
                ppUnit = linesData[i].unit_index;
              }
    
              if (linesData[i].unit_type === "penalty_kill") {
                pkUnit = linesData[i].unit_index;
              }
    
              if (linesData[i].unit_type === "even_strength") {
                if (linesData[i].position === "L") {
                  lw = linesData[i].player;
                  lwImg = linesData[i].headshot;
                } else if (linesData[i].position === "C") {
                  c = linesData[i].player;
                  cImg = linesData[i].headshot;
                } else if (linesData[i].position === "R") {
                  rw = linesData[i].player;
                  rwImg = linesData[i].headshot;
                } else if (linesData[i].position === "LD") {
                  ld = linesData[i].player;
                  ldImg = linesData[i].headshot;
                } else if (linesData[i].position === "RD") {
                  rd = linesData[i].player;
                  rdImg = linesData[i].headshot;
                }
              }}
          }
        }).catch((error) => {console.error("Error fetching lines data:", error);}),

      fetch(`/salary?playerName=${encodeURIComponent(player.PlayerName)}`).then((response) => response.json()).then((data) => {
          if (data.length === 0) {
            console.log("No data returned for salary.");
            return null;
          }
          salaryData = data;
          currentPay = data.find(item => item.Year === 2024);
        }).catch((error) => {console.error("Error fetching salary data:", error);}),
    ];

  const playerNameParts = player.PlayerName.split(" ");
  const firstName = playerNameParts.slice(0, -1).join(" ");
  const lastName = playerNameParts.slice(-1).join(" ");

  let radarData = {};
  let playerData = [];
  let recentGamesData = {};
  let linesData = {};
  let salaryData = [];
  let currentPay = {};

  let hex_codes = "";

  let ppUnit = "", pkUnit = "", line = "", lw = "", c = "", rw = "", ld = "", rd = "", cImg = "", lwImg = "", rwImg = "", ldImg = "", rdImg = ""; injStatus = ""; updateTime = "";

  let linemates = {}, colors = {};

  Promise.all(fetchPromises)
    .then(([sidebar,recentGames,shots,lines, salary]) => {

      document.querySelectorAll('.player-highlight').forEach(row => {
        row.classList.remove('player-highlight');
      });
    
      const playerRow = document.querySelector(`#PlayersGeneral_stats tr[data-player="${player.PlayerName}"]`);
      if (playerRow) {
        playerRow.classList.add('player-highlight');
      }

      document.getElementById("sidebar-player-number").textContent = `${player.JerseyNumber}`;
      document.getElementById("sidebar-first-name").textContent = firstName;
      document.getElementById("sidebar-last-name").textContent = lastName;


      document.getElementById("sidebar-top-goals").textContent = player.Goals;
      document.getElementById("sidebar-top-assists").textContent = player.TotalAssists;
      document.getElementById("sidebar-top-points").textContent = player.Points;
      document.getElementById("sidebar-top-pm").textContent = player.PM;
      document.getElementById("position-rank").textContent = player.Position;



      if(player.CurrentTeamImage === null){
        document.getElementById("sidebar-player-contract").textContent = "Retired";

        document.getElementById("last5").style.display = "none";
        document.getElementById("deployment-stats").style.display = "none";
        document.getElementById("shot-stats-chart").style.display = "none";
        document.getElementById("salary-info").style.display = "none";

        //only update radar chart
        if (window.updateRadarChart) {
          window.updateRadarChart(
            radarData,
            playerData.current_team_hex_codes.primary
          );
        }

      } else {
        document.getElementById("sidebar-player-contract").textContent = `Contract: ${player.AAV}, ${player.Term}`

        if (document.getElementById("season-filter-players").value !== "2024") {
          document.getElementById("last5").style.display = "none";
          document.getElementById("deployment-stats").style.display = "none";
          document.getElementById("shot-stats-chart").style.display = "none";
          document.getElementById("salary-info").style.display = "";
        }else{
          document.getElementById("last5").style.display = "";
          document.getElementById("deployment-stats").style.display = "";
          document.getElementById("shot-stats-chart").style.display = "";
          document.getElementById("salary-info").style.display = "";

          linemates = document.getElementsByClassName("linemate");
        }

        if (window.updateCharts) {
          window.updateCharts(
            radarData,
            shotsData,
            playerData.current_team_hex_codes.primary,
            salaryData
          );
        }
      };


      if(playerData.draft_round === undefined || playerData.draft_pick === undefined || playerData.draft_year === undefined){
        document.getElementById("sidebar-player-draft").textContent = "Unavailable";
      }else{
        document.getElementById("sidebar-player-draft").textContent = `Drafted: Round ${playerData.draft_round}, Pick ${playerData.draft_pick}, ${playerData.draft_year}`;
      }

      colors = playerData.current_team_hex_codes;
      document.getElementById("sidebar-stats-header").style.backgroundColor = colors.primary;
      document.getElementById("highlight-border").style.borderColor = colors.primary;
      document.getElementById("last5").style.borderColor = colors.primary;

      document.getElementById("sidebar-team-logo").style.backgroundImage = `url(${player.CurrentTeamImage})`;        document.getElementById("sidebar-player-position").textContent = `${player.Position}`;
      document.getElementById("sidebar-player-age").textContent = `Age: ${player.Age}`;
      document.getElementById("sidebar-player-weight").textContent = `${player.Weight} lbs`;
      document.getElementById("sidebar-player-shoots").textContent = `Shoots: ${player.ShootsCatches}`;

      document.getElementById("sidebar-player-height").textContent = `${player.Height}`;


      document.getElementById("sidebar-stats-header").textContent = document.getElementById("season-filter-players").value === "2024" ? "Highlight Stats" : "Highlight Stats (" + document.getElementById("season-filter-players").value + ")";

      document.getElementById("sidebar-flag").src = player.flag_image;
      document.getElementById("sidebar-team-logo").style.backgroundImage = `url(${player.TeamImage})`;
      document.getElementById("sidebar-player-image").src = player.PlayerHeadshot;


        ///////////////////HIGHLIGHT RANKS////////////////////////
        let allPlayers = playersData.filter(
          (player) => player.Situation === "all"
        );
        const rankCategories = [
          {
            key: "Goals",
            rankId: "sidebar-goal-rank",
            posRankId: "sidebar-goal-posrank",
          },
          {
            key: "TotalAssists",
            rankId: "sidebar-assist-rank",
            posRankId: "sidebar-assist-posrank",
          },
          {
            key: "Points",
            rankId: "sidebar-point-rank",
            posRankId: "sidebar-point-posrank",
          },
          {
            key: "PM",
            rankId: "sidebar-pm-rank",
            posRankId: "sidebar-pm-posrank",
          },
        ];

        rankCategories.forEach(({ key, rankId, posRankId }) => {
          let rank, posRank;
          let tieString = "";

          const sortedByKey = allPlayers.sort((a, b) => b[key] - a[key]);
          rank =
            sortedByKey.findIndex((p) => p.PlayerName === player.PlayerName) +
            1;
          while (
            rank > 1 &&
            sortedByKey[rank - 1][key] === sortedByKey[rank - 2][key]
          ) {
            rank--;
            tieString = "T-";
          }
          if (
            rank < playersData.length &&
            sortedByKey[rank - 1][key] === sortedByKey[rank][key]
          ) {
            tieString = "T-";
          }

          const samePositionPlayers = allPlayers.filter(
            (p) => p.Position === player.Position
          );
          const sortedByKeySamePosition = samePositionPlayers.sort(
            (a, b) => b[key] - a[key]
          );
          posRank =
            sortedByKeySamePosition.findIndex(
              (p) => p.PlayerName === player.PlayerName
            ) + 1;
          while (
            posRank > 1 &&
            sortedByKeySamePosition[posRank - 1][key] ===
              sortedByKeySamePosition[posRank - 2][key]
          ) {
            posRank--;
          }
          if (
            posRank < samePositionPlayers.length &&
            sortedByKeySamePosition[posRank - 1][key] ===
              sortedByKeySamePosition[posRank][key]
          ) {
            tieString = "T-";
          }

          const getSuffix = (num) => {
            const j = num % 10,
              k = num % 100;
            if (j == 1 && k != 11) {
              return num + "st";
            }
            if (j == 2 && k != 12) {
              return num + "nd";
            }
            if (j == 3 && k != 13) {
              return num + "rd";
            }
            return num + "th";
          };

          document.getElementById(rankId).textContent = tieString + getSuffix(rank);
          document.getElementById(posRankId).textContent = tieString + getSuffix(posRank);
        });

      // Update the last 5 games table
      if (recentGamesData.length > 0) {
        const tbody = document.getElementById("last5games");
        tbody.innerHTML = ""; // Clear existing rows

        recentGamesData.forEach((game) => {
          const oppLogo = game.OpponentImage
            ? `<img src="${game.OpponentImage}" alt="${game.OPP} logo" class="team-logo">`
            : "";

          let gameType = "";
          if (game.GameType !== "REG") {
            gameType = `${game.GameType}`;
          }

          const resultColour = game.Result.includes("W") ? "green" : "red";

          const teamWin = game.Result.charAt(0);
          const score = game.Result.slice(1);

          const gameDate = formatDate(new Date(game.Date), false);

          const tr = document.createElement("tr");
          tr.innerHTML = `
                      <td>${gameDate}</td>
                      <td><span id="oppName"> ${game.OPP} ${oppLogo}</span></td>
                      <td>
                        <div style="display: flex; gap: 5px;">
                          <span style="color: ${resultColour}; width: 12px;" >${teamWin}</span>
                          <span style="color: black;">${score} ${gameType}</span>
                        </div>
                      </td>
                      <td>${game.G}</td>
                      <td>${game.A}</td>
                      <td>${game.PTS}</td>
                      <td>${game.PM}</td>
                      <td>${game.S}</td>
                      <td>${game.PIM}</td>
                      <td>${game.TOI}</td>
                    `;
          tbody.appendChild(tr);
        });
      }


      ////Update the deployment table
      document.getElementById("last-update").textContent = `Updated: `+ updateTime;

      if (injStatus === "") {
        document.getElementById("deployment-line").textContent = document.getElementById("deployment-line")
        .textContent.split(":")[0] + ": Line " + line;

        document.getElementById("line-img").style.display = "";
        document.getElementById("line-content").style.display = "";
        document.getElementById("deployment-content").style.display = "";

        if (player.Position.includes("D")) {
          document.getElementById("C").style.display = "none";
          document.getElementById("Cimg").style.display = "none";
          document.getElementById("line-img").style.gap = "35px";

          document.getElementById("R").textContent = splitName(rd);
          document.getElementById("L").textContent = splitName(ld);

          document.getElementById("Rimg").src = rdImg;
          document.getElementById("Limg").src = ldImg;
        } else {
          document.getElementById("C").style.display = "";
          document.getElementById("Cimg").style.display = "";

          document.getElementById("line-img").style.gap = "10px";

          document.getElementById("C").textContent = splitName(c);
          document.getElementById("R").textContent = splitName(rw);
          document.getElementById("L").textContent = splitName(lw);

          document.getElementById("Cimg").src = cImg;
          document.getElementById("Rimg").src = rwImg;
          document.getElementById("Limg").src = lwImg;
        }

        for (let i = 0; i < linemates.length; i++) {
          linemates[i].style.borderColor = colors.primary;

          if (
            linemates[i].textContent
              .trim()
              .toLowerCase()
              .includes(lastName.toLowerCase())
          ) {
            linemates[i].style.backgroundColor = "white";
            linemates[i].style.color = "black";
          } else {
            linemates[i].style.backgroundColor = colors.primary;
            linemates[i].style.color = "white";
          }
        }

        document.getElementById("ppUnit").textContent =
          "Power Play Unit: " + ppUnit;
        document.getElementById("pkUnit").textContent =
          "Penalty Kill Unit: " + pkUnit;

        document.getElementById("injury-content").style.display = "none";
      } else{
        document.getElementById("line-img").style.display = "none";
        document.getElementById("line-content").style.display = "none";
        document.getElementById("deployment-content").style.display = "none";

        document.getElementById("deployment-line").textContent = "Deployment:"
        document.getElementById("injury-content").style.display = "";
        document.getElementById("injury-status").textContent = injStatus;
        
      }

      ///////Update the salary table
      if(Object.keys(salaryData).length < 1){
          currentPay.AAV = "N/A";
          currentPay.Cap_Start = "N/A";
          currentPay.Clauses = "N/A";
          currentPay.Signed_On = "N/A";

          document.getElementById("contractGraph").style.display = "none";
          document.getElementById("signing-details").style.display = "none";

      }else{
        document.getElementById("contractGraph").style.display = "";
        document.getElementById("signing-details").style.display = "";

        currentPay.AAV = "$" + Number(currentPay.AAV).toLocaleString();
      }

      document.getElementById("term").textContent = `Term: ` + `${(currentPay.total_years + 1 - currentPay.years_left)}`+` / `+ currentPay.total_years;

      const signed = formatDate(new Date(currentPay.Signed_On));
      document.getElementById("signing-date").textContent = `Signed: ` + signed;

      const tbody = document.getElementById("salary-content");
      tbody.innerHTML = ""; 
      const tr = document.createElement("tr");
      tr.innerHTML = `
                  <td>${currentPay.AAV}</td>
                  <td>${currentPay.Cap_Start}</td>
                  <td>${currentPay.Clauses}</td>
                  <td>${currentPay.UFA_Year}</td>
                  `;
      tbody.appendChild(tr);


      adjustFontSize();
      document.getElementById("player-sidebar").classList.add("show");
    })
    .catch((error) => {
      console.error("Error in fetching data:", error);
    });
}

let currentSelectedIndex = -1;
let isNavigating = false;


document.addEventListener("keydown", (event) => { 
  if(!document.getElementById("player-sidebar").classList.contains("show")) return;

  const rows = document.querySelectorAll('#PlayersGeneral_stats tr');
  if(rows.length === 0) return;

  switch(event.key) {
    case "ArrowUp":
      event.preventDefault();
      navigatePlayer(rows, -1);
      break;
    case "ArrowDown":
      event.preventDefault();
      navigatePlayer(rows, 1);
      break;
  }
});

document.querySelectorAll('.scroll-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const direction = e.target.getAttribute('data-direction');
    const num = direction === 'left' ? -1 : 1;
    const rows = document.querySelectorAll('#PlayersGeneral_stats tr');
    navigatePlayer(rows, num);
  });
});

const navigatePlayer = debounce(async (rows, direction) => {
  if(isNavigating) return;
  isNavigating = true;

  //make sure a player is selected
  if(currentSelectedIndex === -1) {
      currentSelectedIndex = 0;
     } else {
      currentSelectedIndex = Math.max(0, Math.min(rows.length - 1, currentSelectedIndex + direction));
  }

  // Get the player name and trigger sidebar update
  const selectedRow = rows[currentSelectedIndex];
  const playerName = selectedRow.getAttribute('data-player');
  const player = playersData.find(p => p.PlayerName === playerName);

  if (player) {
      // Remove highlight from all rows
      document.querySelectorAll('.player-highlight').forEach(row => {
          row.classList.remove('player-highlight');
      });

      // Add highlight to selected row
      selectedRow.classList.add('player-highlight');
      
      // Ensure the row is visible
      selectedRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      try {
        // Wait for sidebar to fully load before allowing next navigation
        await new Promise((resolve, reject) => {
          showPlayerSidebar(player);
          const sidebar = document.getElementById("player-sidebar");
          
          // Create a mutation observer to watch for changes
          const observer = new MutationObserver((mutations) => {
            if (mutations.some(m => m.target.classList.contains('show'))) {
              observer.disconnect();
              resolve();
            }
          });
  
          // Start observing
          observer.observe(sidebar, {
            attributes: true,
            attributeFilter: ['class']
          });
  
          // Timeout after 5 seconds to prevent hanging
          setTimeout(() => {
            observer.disconnect();
            resolve();
          }, 5000);
        });
      } catch (error) {
        console.error('Error updating sidebar:', error);
      } finally {
        isNavigating = false; // Reset navigation flag regardless of outcome
      }
    } else {
      isNavigating = false;
    }
},50);
////////////////////////FILTERS////////////////////////
const per60ToggleDiv = document.createElement("div");
per60ToggleDiv.classList.add("filter");

const per60ToggleLabel = document.createElement("label");
per60ToggleLabel.textContent = "Per 60:";

const per60ToggleInput = document.createElement("input");
per60ToggleInput.type = "checkbox";
per60ToggleInput.id = "per60-btn-container";

per60ToggleDiv.appendChild(per60ToggleLabel);
per60ToggleDiv.appendChild(per60ToggleInput);


// Insert filters into the Players section
const playersFiltersContainer = document.createElement("div");
playersFiltersContainer.classList.add("filters");
playersFiltersContainer.appendChild(createPositionFilter("position-filter-players"));
playersFiltersContainer.appendChild(createTeamFilter("team-filter-players"));
playersFiltersContainer.appendChild(createSituationFilter("situation-filter-players"));
playersFiltersContainer.appendChild(createNationalityFilter("nat-filter-players"));
playersFiltersContainer.appendChild(createSeasonFilter("season-filter-players"));
playersFiltersContainer.appendChild(createMinutesFilter("minutes-filter-players"));
playersFiltersContainer.appendChild(createGradientToggle());
//playersFiltersContainer.appendChild(per60ToggleDiv);
document.querySelector("#PlayersGeneral .filter-container").appendChild(playersFiltersContainer);

// Insert filters into the Advanced Stats section
const advancedPlayersFiltersContainer = document.createElement("div");
advancedPlayersFiltersContainer.classList.add("filters");
document.querySelector("#PlayersAdvanced .filter-container").appendChild(advancedPlayersFiltersContainer);

// Insert filters into the Goalies section
const goaliesFiltersContainer = document.createElement("div");
goaliesFiltersContainer.classList.add("filters");
goaliesFiltersContainer.appendChild(createTeamFilter("team-filter-goalies"));
goaliesFiltersContainer.appendChild(createSituationFilter("situation-filter-goalies"));
goaliesFiltersContainer.appendChild(createNationalityFilter("nat-filter-goalies"));
goaliesFiltersContainer.appendChild(createSeasonFilter("season-filter-goalies"));
goaliesFiltersContainer.appendChild(createGamesPlayedFilter("games-filter-goalies"));
goaliesFiltersContainer.appendChild(createGradientToggle());
document.querySelector("#Goalies .filter-container").appendChild(goaliesFiltersContainer);


//inset filters into standings section
const standingsFiltersContainer = document.createElement("div");
standingsFiltersContainer.classList.add("filters");
standingsFiltersContainer.appendChild(createDivisionFilter("group-filter-standings"));
standingsFiltersContainer.appendChild(createGradientToggle());

document.querySelector("#Standings .filter-container").appendChild(standingsFiltersContainer);

function createGradientToggle() {
  const toggleDiv = document.createElement("div");
  toggleDiv.classList.add("filter");

  const toggleLabel = document.createElement("label");
  toggleLabel.textContent = "Gradient:";

  const toggleInput = document.createElement("input");
  toggleInput.type = "checkbox";
  toggleInput.classList.add("gradient-toggle");
  
  toggleDiv.appendChild(toggleLabel);
  toggleDiv.appendChild(toggleInput);

  toggleInput.checked = isGradientEnabled;
  toggleInput.addEventListener("change", () => {
    isGradientEnabled = toggleInput.checked;
    document.querySelectorAll('.gradient-toggle').forEach(input => {
      input.checked = isGradientEnabled;
    });
    gradientColumn();
  });

  return toggleDiv;
}


function gradientColumn() {
  const tableId = determineVisibleTable();
  if (!tableId) return;

  const tbody = document.querySelector(`#${tableId}_stats`);
  if (!tbody) return;

  const columns = tbody.querySelectorAll("td:nth-child(n+3)"); // Skip the first two columns (rank and player name)
  const columnCount = columns[0] ? columns[0].parentElement.children.length : 0;

  // Define an array of column indices to exclude (e.g., exclude columns 2 and 5)
  let excludedColumns;
  let reverseColumns;

  const rowColors = ["#000000", "#181818"];

  let tableData, columnMetaData;
  switch (tableId) {
    case 'PlayersGeneral':
      excludedColumns = [1,2,3];
      reverseColumns = [];
      tableData = playersData;
      columnMetaData = columnMeta;
      break;
    case 'Goalies':
      excludedColumns = [1,2];
      reverseColumns = [4,6,9,10,12,];
      tableData = goalieData;
      columnMetaData = goalieColumnMeta;
      break;
    case 'Standings':
      excludedColumns = [1,2];
      reverseColumns = [4,5,11,14,];
      tableData = standingsData;
      columnMetaData = standingsColumnMeta;
      break;
    default:
      return;
  }

  for (let colIndex = 2; colIndex < columnCount; colIndex++) {
    if (excludedColumns.includes(colIndex)) continue; 

    const cells = tbody.querySelectorAll(`td:nth-child(${colIndex + 1})`);
    if (cells.length === 0) continue;

    const headerCell = document.querySelector(`#${tableId} th:nth-child(${colIndex + 1})`);
    if (!headerCell) continue;
    
    const columnName = headerCell.getAttribute('data-column');
    if (!columnName || !columnMetaData[columnName]) continue;

    const meta = columnMetaData[columnName];
    const reverse = reverseColumns.includes(colIndex);
    
    const processedValues = Array.from(cells).map(cell => {
      const rawValue = cell.textContent.trim();
      return meta.transform ? 
        meta.transform(rawValue) : 
        (meta.type === 'number' ? parseFloat(rawValue) || 0 : rawValue);
    });

    const sortedValues = [...processedValues].sort((a, b) => reverse ? a - b : b - a);

    cells.forEach((cell, rowIndex) => {
      if (!isGradientEnabled) {
        cell.style.backgroundColor = rowColors[rowIndex % 2];
        return;
      }

      const value = processedValues[rowIndex];
      const rank = sortedValues.indexOf(value) + 1;
      const normalizedRank = rank / sortedValues.length;
      
      const backgroundColor = getGradientColor(normalizedRank);
      cell.style.backgroundColor = backgroundColor || rowColors[rowIndex % 2];
    });
  }
}

function getGradientColor(value) {
  const tableType = determineVisibleTable();
  let threshold = 0.3; // Default threshold for PlayersGeneral (30%)
  
  if (tableType === 'Goalies' || tableType === 'Standings') {
    threshold = 0.75; // 50% for Goalies and Standings tables
  }
  
  if (value === null || value === undefined || value >= threshold) {
    return null;
  }
  
  const normalized = value / threshold;
  const opacity = Math.max(0.1, 0.8 - normalized);
  return `rgba(77, 133, 238, ${opacity})`;
}


// Filter functionality for tables
function createPositionFilter(id) {
  const positionFilter = document.createElement("div");
  positionFilter.classList.add("filter");

  const positionLabel = document.createElement("label");
  positionLabel.setAttribute("for", "position-filter");
  positionLabel.textContent = "Position:";
  positionFilter.appendChild(positionLabel);

  const positionSelect = document.createElement("select");
  positionSelect.id = id;
  positionSelect.innerHTML = `
                <option value="">All</option>
                <option value="C">Center</option>
                <option value="LW">Left Wing</option>
                <option value="RW">Right Wing</option>
                <option value="LD">Left Defense</option>
                <option value="RD">Right Defense</option>
                <option value="Forward">Forward</option>
                <option value="Defense">Defense</option>
            `;
  positionFilter.appendChild(positionSelect);

  positionSelect.addEventListener("change", () => {
    if(determineVisibleTable() === "PlayersGeneral"){
      applyFilters();
    }
  });
  return positionFilter;
}

function createTeamFilter(id) {
  const teamFilter = document.createElement("div");
  teamFilter.classList.add("filter");

  const teamLabel = document.createElement("label");
  teamLabel.setAttribute("for", id);
  teamLabel.textContent = "Team:";
  teamFilter.appendChild(teamLabel);

  const teamSelect = document.createElement("select");
  teamSelect.id = id;
  teamSelect.innerHTML = `
                <option value="">All</option>
                <option value="ATL">Atlanta Thrashers</option>
                <option value="ANA">Anaheim Ducks</option>
                <option value="ARI">Arizona Coyotes</option>
                <option value="BOS">Boston Bruins</option>
                <option value="BUF">Buffalo Sabres</option>
                <option value="CGY">Calgary Flames</option>
                <option value="CAR">Carolina Hurricanes</option>
                <option value="CHI">Chicago Blackhawks</option>
                <option value="COL">Colorado Avalanche</option>
                <option value="CBJ">Columbus Blue Jackets</option>
                <option value="DAL">Dallas Stars</option>
                <option value="DET">Detroit Red Wings</option>
                <option value="EDM">Edmonton Oilers</option>
                <option value="FLA">Florida Panthers</option>
                <option value="LAK">Los Angeles Kings</option>
                <option value="MIN">Minnesota Wild</option>
                <option value="MTL">Montreal Canadiens</option>
                <option value="NSH">Nashville Predators</option>
                <option value="NJD">New Jersey Devils</option>
                <option value="NYI">New York Islanders</option>
                <option value="NYR">New York Rangers</option>
                <option value="OTT">Ottawa Senators</option>
                <option value="PHI">Philadelphia Flyers</option>
                <option value="PHX">Phoenix Coyotes</option>
                <option value="PIT">Pittsburgh Penguins</option>
                <option value="SJS">San Jose Sharks</option>
                <option value="SEA">Seattle Kraken</option>
                <option value="STL">St. Louis Blues</option>
                <option value="TBL">Tampa Bay Lightning</option>
                <option value="TOR">Toronto Maple Leafs</option>
                <option value="UTA">Utah Hockey Club</option>
                <option value="VAN">Vancouver Canucks</option>
                <option value="VGK">Vegas Golden Knights</option>
                <option value="WSH">Washington Capitals</option>
                <option value="WPG">Winnipeg Jets</option>
            `;
  teamFilter.appendChild(teamSelect);

  teamSelect.addEventListener("change", () => {
    const activeSection = determineVisibleTable();
    if((activeSection === "PlayersGeneral" && id === "team-filter-players") || (activeSection === "Goalies" && id === "team-filter-goalies")){
      applyFilters();
    }
  });
  return teamFilter;
}

function createNationalityFilter(id) {
  const natFilter = document.createElement("div");
  natFilter.classList.add("filter");

  const natLabel = document.createElement("label");
  natLabel.setAttribute("for", "nat-filter");
  natLabel.textContent = "Nationality:";
  natFilter.appendChild(natLabel);

  const natSelect = document.createElement("select");
  natSelect.id = id;
  natSelect.innerHTML = `
    <option value="">All</option>
    <option value="AUS">Australia</option>
    <option value="AUT">Austria</option>
    <option value="BHS">Bahamas</option>
    <option value="BLR">Belarus</option>
    <option value="CAN">Canada</option>
    <option value="CHE">Switzerland</option>
    <option value="CZE">Czech Republic</option>
    <option value="DEU">Germany</option>
    <option value="DNK">Denmark</option>
    <option value="FIN">Finland</option>
    <option value="FRA">France</option>
    <option value="GBR">United Kingdom</option>
    <option value="HRV">Croatia</option>
    <option value="KAZ">Kazakhstan</option>
    <option value="LTU">Lithuania</option>
    <option value="LVA">Latvia</option>
    <option value="NGA">Nigeria</option>
    <option value="NLD">Netherlands</option>
    <option value="NOR">Norway</option>
    <option value="POL">Poland</option>
    <option value="RUS">Russia</option>
    <option value="SUI">Switzerland</option>
    <option value="SVK">Slovakia</option>
    <option value="SVN">Slovenia</option>
    <option value="SWE">Sweden</option>
    <option value="UKR">Ukraine</option>
    <option value="USA">United States</option>
    `;
  natFilter.appendChild(natSelect);

  natSelect.addEventListener("change", applyFilters);

  return natFilter;
}

//create season filter and default is 2024-2025
function createSeasonFilter(id) {
  const seasonFilter = document.createElement("div");
  seasonFilter.classList.add("filter");

  const seasonLabel = document.createElement("label");
  seasonLabel.setAttribute("for", "season-filter");
  seasonLabel.textContent = "Season:";
  seasonFilter.appendChild(seasonLabel);

  const seasonSelect = document.createElement("select");
  seasonSelect.id = id;
  seasonSelect.innerHTML = `
                <option value="2024">2024-2025</option>
                <option value="2023">2023-2024</option>
                <option value="2022">2022-2023</option>
                <option value="2021">2021-2022</option>
                <option value="2020">2020-2021</option>
                <option value="2019">2019-2020</option>
                <option value="2018">2018-2019</option>
                <option value="2017">2017-2018</option>
                <option value="2016">2016-2017</option>
                <option value="2015">2015-2016</option>
                <option value="2014">2014-2015</option>
                <option value="2013">2013-2014</option>
                <option value="2012">2012-2013</option>
                <option value="2011">2011-2012</option>
                <option value="2010">2010-2011</option>
                <option value="2009">2009-2010</option>
            `;
  seasonFilter.appendChild(seasonSelect);

  seasonSelect.addEventListener("change", () => {
    const activeSection = determineVisibleTable();
    switch (activeSection) {
      case "PlayersGeneral":
        playersData = [];
        filteredPlayersData = [];
        fetchPlayers();
        break;
      case "PlayersAdvanced":
        advancedPlayersData = [];
        filteredAdvancedPlayersData = [];
        fetchAdvancedPlayers();
        break;
      case "Goalies":
        goaliesData = [];
        filteredGoalieData = [];
        fetchGoalies();
        break;
    }
  });

  return seasonFilter;
}

function createSituationFilter(id) {
  const situationFilter = document.createElement("div");
  situationFilter.classList.add("filter");

  const situationLabel = document.createElement("label");
  situationLabel.setAttribute("for", "situation-filter");
  situationLabel.textContent = "Situation:";
  situationFilter.appendChild(situationLabel);

  const situationSelect = document.createElement("select");
  situationSelect.id = id;
  situationSelect.innerHTML = `
                <option value="all" slected>All</option>
                <option value="5on5">Even Strength</option>
                <option value="5on4">Power Play</option>
                <option value="4on5">Penalty Kill</option>
                <option value="other">Other</option>
            `;
  situationFilter.appendChild(situationSelect);

  situationSelect.removeEventListener("change", applyFilters);

  situationSelect.addEventListener("change", () => {
    const activeSection = determineVisibleTable();
    if(["PlayersGeneral","Goalies"].includes(activeSection)){
      applyFilters();
    }
  });

  return situationFilter;
}

function createMinutesFilter(id) {
  const minutesFilter = document.createElement("div");
  minutesFilter.classList.add("filter");

  const minutesLabel = document.createElement("label");
  minutesLabel.setAttribute("for", "minutes-filter");
  minutesLabel.textContent = "Min. TOI: ";
  minutesFilter.appendChild(minutesLabel);

  const toggleButton = document.createElement("button");
  toggleButton.textContent = "Select";
  toggleButton.type = "button";
  toggleButton.classList.add("toggle-slider-button");
  minutesFilter.appendChild(toggleButton);

  // Create a container for the slider box
  const sliderContainer = document.createElement("div");
  sliderContainer.classList.add("slider-container");
  document.body.appendChild(sliderContainer); // Append to body or a specific parent container

  const sliderBox = document.createElement("div");
  sliderBox.classList.add("slider-box");
  sliderContainer.appendChild(sliderBox);

  const minutesSlider = document.createElement("input");
  minutesSlider.id = id;
  minutesSlider.type = "range";
  minutesSlider.min = 0;
  minutesSlider.max = 1500;
  minutesSlider.value = 400;
  minutesSlider.step = 1;

  sliderBox.appendChild(minutesSlider);

  const minutesOutput = document.createElement("span");
  minutesOutput.id = "minutes-output";
  minutesOutput.textContent = "0 minutes";
  sliderBox.appendChild(minutesOutput);

  const debounceFilters = debounce(applyFilters, 20);
  minutesSlider.addEventListener("input", () => {
    minutesOutput.textContent = `${minutesSlider.value} minutes`;
    debounceFilters();
  });

  toggleButton.addEventListener("click", () => {
    const rect = minutesLabel.getBoundingClientRect();
    sliderContainer.style.position = "absolute";
    sliderContainer.style.top = `${rect.bottom + window.scrollY}px`;
    sliderContainer.style.left = `${rect.left + window.scrollX - 75}px`;
    sliderBox.classList.toggle("show");
    toggleButton.textContent = sliderBox.classList.contains("show")
      ? "Select"
      : `${minutesSlider.value} minutes`;
  });

  document.addEventListener("click", (event) => {
    const isClickInside =
      sliderBox.contains(event.target) || toggleButton.contains(event.target);
    if (!isClickInside) {
      sliderBox.classList.remove("show");
      toggleButton.textContent = `${minutesSlider.value} minutes`;
    }
  });

  return minutesFilter;
}

function createGamesPlayedFilter(id){
  const gamesFilter = document.createElement("div");
  gamesFilter.classList.add("filter");

  const gamesLabel = document.createElement("label");
  gamesLabel.setAttribute("for", "games-filter");
  gamesLabel.textContent = "Min. GP: ";
  gamesFilter.appendChild(gamesLabel);

  const toggleButton = document.createElement("button");
  toggleButton.textContent = "Select";
  toggleButton.type = "button";
  toggleButton.classList.add("toggle-slider-button");
  gamesFilter.appendChild(toggleButton);

  // Create a container for the slider box
  const sliderContainer = document.createElement("div");
  sliderContainer.classList.add("slider-container");
  document.body.appendChild(sliderContainer);

  const sliderBox = document.createElement("div");
  sliderBox.classList.add("slider-box");
  sliderContainer.appendChild(sliderBox);

  const gamesSlider = document.createElement("input");
  gamesSlider.id = id;
  gamesSlider.type = "range";
  gamesSlider.min = 0;
  gamesSlider.max = 82;
  gamesSlider.value = 20;
  gamesSlider.step = 1;

  sliderBox.appendChild(gamesSlider);

  const gamesOutput = document.createElement("span");
  gamesOutput.id = "games-output";
  gamesOutput.textContent = "0 games";
  sliderBox.appendChild(gamesOutput);

  const debounceFilters = debounce(applyFilters, 20);
  gamesSlider.addEventListener("input", () => {
    gamesOutput.textContent = `${gamesSlider.value} games`;
    debounceFilters();
  });

  toggleButton.addEventListener("click", () => {
    const rect = gamesLabel.getBoundingClientRect();
    sliderContainer.style.position = "absolute";
    sliderContainer.style.top = `${rect.bottom + window.scrollY}px`;
    sliderContainer.style.left = `${rect.left + window.scrollX - 75}px`;
    sliderBox.classList.toggle("show");
    toggleButton.textContent = sliderBox.classList.contains("show")
      ? "Select"
      : `${gamesSlider.value} games`;
  });

  document.addEventListener("click", (event) => {
    const isClickInside =
      sliderBox.contains(event.target) || toggleButton.contains(event.target);
    if (!isClickInside) {
      sliderBox.classList.remove("show");
      toggleButton.textContent = `${gamesSlider.value} games`;
    }
  });

  return gamesFilter;
}


///filter that tells the table to sort by either division or conference
function createDivisionFilter(id) {
  const divisionFilter = document.createElement("div");
  divisionFilter.classList.add("filter");

  const divisionLabel = document.createElement("label");
  divisionLabel.setAttribute("for", "division-filter");
  divisionLabel.textContent = "Group By:";
  divisionFilter.appendChild(divisionLabel);

  const divisionSelect = document.createElement("select");
  divisionSelect.id = id;
  divisionSelect.innerHTML = `
                <option value="none">League</option>
                <option value="division">Division</option>
                <option value="conference">Conference</option>
            `;
  divisionFilter.appendChild(divisionSelect);

  divisionSelect.addEventListener("change", applyFilters);

  return divisionFilter;
}



function applySearch(data,searchValue){
    if(!searchValue) return data;
    return data.filter((player) => {
      return player.PlayerName.toLowerCase().includes(searchValue.toLowerCase());
    });
}

function applyTeamSearch(data,searchValue){
  if(!searchValue) return data;

  console.log(data);
  console.log(searchValue);
  return data.filter((team) => {
    return team.teamName.toLowerCase().includes(searchValue.toLowerCase());
  });
}


// Function to apply filters
function applyFilters() {
  const activeSection = determineVisibleTable();
  switch (activeSection) {
    case "PlayersGeneral":
      applyPlayerFilters();
      break;
    case "PlayersAdvanced":
      applyAdvancedFilters();
      break;
    case "Goalies":
      applyGoalieFilters();
      break;
    case "Standings":
      applyStandingsFilters();
      break;
  }
}

function applyPlayerFilters() {
  // Retrieve filter values
  const positionValue = document.getElementById("position-filter-players").value;
  const teamValuePlayers = document.getElementById("team-filter-players").value;
  const situationValue = document.getElementById("situation-filter-players").value;
  const natValue = document.getElementById("nat-filter-players").value;
  const seasonValue = document.getElementById("season-filter-players").value;
  const minutesValue = parseInt(document.getElementById("minutes-filter-players").value,10);

  filteredPlayersData = playersData.filter((player) => {
    const matchesPosition = !positionValue || player.Position === positionValue || (positionValue === "Forward" && ["C", "LW", "RW"].includes(player.Position)) || (positionValue === "Defense" && ["RD", "LD", "D"].includes(player.Position));
    const matchesTeam = !teamValuePlayers || player.Team === teamValuePlayers;
    const matchesSituation = !situationValue || player.Situation === situationValue;
    const matchesNat = !natValue || player.Nationality === natValue;
    const matchesSeason = !seasonValue || player.Season === Number(seasonValue);
    const matchesMinutes = !minutesValue || player.Total_TOI >= minutesValue;

    return (
        matchesPosition &&
        matchesTeam &&
        matchesSituation &&
        matchesNat &&
        matchesMinutes &&
        matchesSeason
    );
  });

  sortData(filteredPlayersData);


  let displayData = filteredPlayersData;
  
  searchValue = document.getElementById("search-players-general").value;

  displayData = applySearch(filteredPlayersData, searchValue);

  renderTable(displayData, "PlayersGeneral");
} 

function applyAdvancedFilters() {
    // Filter players data for advanced stats
} 
  
function applyGoalieFilters() {
  const gamesValue = parseInt(document.getElementById("games-filter-goalies").value,10);
  const teamValue = document.getElementById("team-filter-goalies").value;
  const situationValue = document.getElementById("situation-filter-goalies").value;
  const seasonValue = document.getElementById("season-filter-goalies").value;
  const natValue = document.getElementById("nat-filter-goalies").value;

  filteredGoalieData = goalieData.filter((goalie) => {
    const matchesTeam = !teamValue || goalie.Team === teamValue;
    const matchesSeason = !seasonValue || goalie.Season === Number(seasonValue);
    const matchesGames = !gamesValue || goalie.GamesPlayed >= gamesValue;
    const matchesSituation = !situationValue || goalie.Situation === situationValue;
    const matchesNat = !natValue || goalie.Nationality === natValue;
        
    return matchesTeam && matchesSeason && matchesGames && matchesSituation && matchesNat;
  });

  sortData(filteredGoalieData);

  let displayData = filteredGoalieData;

  searchValue = document.getElementById("goalie-search").value;
  displayData = applySearch(filteredGoalieData, searchValue);
    
  renderTable(displayData, "Goalies");
}

function applyStandingsFilters() {

  filteredStandingsData = standingsData.filter((team) => {
    return true;
  });

  sortData(filteredStandingsData);

  let displayData = filteredStandingsData;
  
  searchValue = document.getElementById("team-search").value;
  displayData = applyTeamSearch(filteredStandingsData, searchValue);

  renderTable(displayData, "Standings");
}