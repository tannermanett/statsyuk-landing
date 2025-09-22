const positionAverages = {
  center: [54.34, 52.71, 58.64, 59.43, 49.65, 52.87, 52.30, 50.83, 48.32, 50.68, 43.71],
  winger: [54.24, 53.04, 56.34, 59.04, 47.60, 51.65, 50.99, 43.14, 42.06, 51.46, 36.38],
  defence: [28.99, 43.37, 28.86, 32.58, 44.74, 40.50, 46.21, 54.76, 52.08, 46.36, 66.18]
};
positionAverages.center.push(45.74);
positionAverages.winger.push(46.00);
positionAverages.defence.push(51.70);

const playerStats = [
  {
    "group": "center",
    "goals": 0.5434450503964293,
    "sog": 0.5270758122743683,
    "shooting": 0.5864548395080695,
    "xg": 0.5943279480417512,
    "assists": 0.49650510791919433,
    "points": 0.528735779331063,
    "ozone": 0.523047511756322,
    "dzone": 0.5083638442959433,
    "takeaways": 0.4832467078031248,
    "hits": 0.5068404297991824,
    "blocks": 0.43709194254551087,
    "+/-": 0.4573926237857975
  },
  {
    "group": "winger",
    "goals": 0.5423763179237637,
    "sog": 0.5304006833359218,
    "shooting": 0.5634199582405823,
    "xg": 0.5903737640420355,
    "assists": 0.4760530448137218,
    "points": 0.5165312073993548,
    "ozone": 0.5099264896205412,
    "dzone": 0.43140325447360717,
    "takeaways": 0.42062690894031146,
    "hits": 0.5146201100930092,
    "blocks": 0.36383755241497145,
    "+/-": 0.46000913485983125
  },
  {
    "group": "defense",
    "goals": 0.28992955721679137,
    "sog": 0.43373426618107475,
    "shooting": 0.28861574340297746,
    "xg": 0.3258657593763976,
    "assists": 0.44741949396204683,
    "points": 0.4050100632547444,
    "ozone": 0.4621549741230591,
    "dzone": 0.5476367324771584,
    "takeaways": 0.5207894064277039,
    "hits": 0.4636844291099608,
    "blocks": 0.6617628266564439,
    "+/-": 0.517023517023517
  }
];


  // Function to map position codes to the keys in positionAverages
function mapPositionCodeToKey(positionCode) {
    switch(positionCode.toUpperCase()) {
      case 'C':
        return 'center';
      case 'LW':
      case 'RW':
        return 'winger';
      case 'LD':
      case 'RD':
        return 'defence';
      default:
        return null;
    }
  }



let radarChart;

function initializeRadarChart() {
    document.addEventListener('DOMContentLoaded', async function() {

        const ctx = document.getElementById('radarChart').getContext('2d');

        var chartSize = 340;
        ctx.canvas.width = chartSize;
        ctx.canvas.height = chartSize;
        
        radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
            labels: ["SOG", "Shooting %", "Goals", "xGoals", "Assists","Points", "+/-", "Ozone Starts", "Dzone Starts", "Takeaways", "Hits", "Blocks"],
            datasets: [{
                label: "Sidney Crosby",
                data: [],
                values: [],
                borderColor: "#BA975A",
                backgroundColor: "#BA975A",
                pointBackgroundColor: '#fff',
                pointRadius: 5,
                pointHoverRadius: 7,
                pointHitRadius: 10,
                pointBorderWidth: 2,
            }, {
                label: "Position Average",
                data: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
                borderColor: "rgba(48, 48, 48, 0.6)",
                backgroundColor: "rgba(140, 140, 142, 0.3)"
            }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                },
                scales: {
                    r:{
                        pointLabels: {
                            font: {
                                size: 8,
                            }
                        },
                        suggestedMin: 0,
                        suggestedMax: 100,
                        angleLines: {
                            display: false
                        },
                        ticks: {
                        beginAtZero: false, 
                        backdropColor: 'transparent',
                        callback: function(value) {
                            return `${value}%`;
                        }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        enabled: true,
                        filter: function(item) {
                            // Exclude "Position Average" dataset from showing tooltips
                            return item.dataset.label !== "Position Average";
                        },
                        callbacks:{
                            label: function(item) {
                                const dataset = item.dataset;
                                const dataIndex = item.dataIndex;
                                const perc = item.formattedValue;
                                const realVal = (dataset.values && dataset.values[dataIndex] !== undefined && !isNaN(dataset.values[dataIndex])) ? 
                                    (Number.isInteger(Number(dataset.values[dataIndex])) ? dataset.values[dataIndex] : Number(dataset.values[dataIndex]).toFixed(2)) : "N/A";
                                const roundedPerc = Number.isInteger(Number(perc)) ? perc : Number(perc).toFixed(2);
                                return ` ${realVal} (${roundedPerc}%)`;
                            }
                        }
                    },
                    legend:{
                        position:'top',
                    }
                }
            }
        });
    }); 
}

initializeRadarChart();


let shotGraph

function initializeShotGraph(){
    document.addEventListener('DOMContentLoaded', function() {
        const ctx = document.getElementById('shotGraph').getContext('2d');

        var chartSize = 340;
        ctx.canvas.width = chartSize;
        ctx.canvas.height = chartSize;

        shotGraph = new Chart(ctx, {
            type: 'bar',
            options: {
            indexAxis: 'y',
            responsive: false,
            maintainAspectRatio: false,
            scales: {
                x: {
                beginAtZero: true,
                },
            },
            plugins: {
                legend: {
                display: true
                },
                datalabels: {
                anchor: (ctx) => ctx.dataset.data[ctx.dataIndex] < 14 ? 'end' : 'center',
                align: (ctx) => ctx.dataset.data[ctx.dataIndex] < 14? 'end' : 'center',   
                color: 'black',    
                formatter: function(value, ctx) {
                    const shotValue = ctx.chart.data.datasets[0].data[ctx.dataIndex]; // Get shot value (dataset[0])
                    const isGoalDataset = ctx.datasetIndex === 1; // Check if this is the goal dataset
                    
                    if(!isGoalDataset && value <15) {
                        return ''; // Don't show non-goal values less than 15
                    }

                    return value === 0 ? '' : value; // Otherwise, show value (unless it's 0)
                }
                
                }
            }
            },
            plugins: [ChartDataLabels]
        });
    });
}

initializeShotGraph();


let contractGraph;

function initializeContractGraph(){
    document.addEventListener('DOMContentLoaded', function() {
        const ctx = document.getElementById('contractGraph').getContext('2d');

        ctx.canvas.width = 300;
        ctx.canvas.height = 150;

        const contractGraphData = {
            labels: ['2021', '2022', '2023', '2024', '2025'],
            datasets: [
                {
                    label: 'Base Salary (Earned)',
                    data: [1000000, 2000000, 3000000, 0, 0], // Future years as 0
                    backgroundColor: '#BA975A',
                    borderColor: 'black',
                    borderWidth: 1,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0,
                },
                {
                    label: 'Base Salary (Future)',
                    data: [0, 0, 0, 4000000, 5000000], // Past years as 0
                    backgroundColor: 'rgba(255, 255, 255)', // Semi-transparent white
                    borderColor: 'grey',
                    borderWidth: 1,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0,
                }
            ],
        };
    

        contractGraph = new Chart(ctx, {
            type: 'bar',
        data: contractGraphData,
        options: {
            responsive: false,
            maintainAspectRatio: false,
            indexAxis: 'x',
            scales: {
                x: {
                    grid:{
                      display: false
                    },
                    barThickness: 'flex',
                    stacked: true,
                    display: true,
                },
                y: {
                    stacked: true,
                    display: true,
                    suggestedMin: 0,
                    suggestedMax: 15000000,
                    ticks: {
                        callback: function(value, index, values) {
                            return '$' + value / 1000000 + 'M';
                        }
                    },
                }
            },
            plugins: {
                legend: {
                    display: true,
                    align: 'center',
                    position: 'top',
                    labels: {
                        boxWidth: 10,
                        boxHeight: 10,
                        usePointStyle: true,
                    }
                },
            },
        }
        });
    });
}

initializeContractGraph();

function updateRadarChart(playerData, teamColour) {
    if (!radarChart) {
        console.error('radarChart is not initialized');
        return;
    }
    if (!playerData) {
        console.error('No player data provided');
        return;
    }

    // Update player data
    radarChart.data.datasets[0].label = playerData.name || 'Player';
    radarChart.data.datasets[0].data = [
        playerData.percentiles.shots,
        playerData.percentiles.Sperc,
        playerData.percentiles.goals,
        playerData.percentiles.xGoals,
        playerData.percentiles.assists,
        playerData.percentiles.points,
        playerData.percentiles.pm,
        playerData.percentiles.ozoneStarts,
        playerData.percentiles.dzoneStarts,
        playerData.percentiles.takeaways,
        playerData.percentiles.hits,
        playerData.percentiles.shotBlocks
    ];

    radarChart.data.datasets[0].values = [
        playerData.shots,
        playerData.Sperc,
        playerData.goals,
        playerData.xGoals,
        playerData.assists,
        playerData.points,
        playerData.pm,
        playerData.ozoneStarts,
        playerData.dzoneStarts,
        playerData.takeaways,
        playerData.hits,
        playerData.shotBlocks
    ];

    // Update colors
    radarChart.data.datasets[0].borderColor = teamColour;
    radarChart.data.datasets[0].backgroundColor = teamColour + "55";

    // Update position averages
    if (playerData.position) {
        const posKey = mapPositionCodeToKey(playerData.position);
        if (posKey && positionAverages[posKey]) {
            radarChart.data.datasets[1].data = positionAverages[posKey];
        } else {
            console.warn(`No average stats defined for position code: ${playerData.position}`);
        }
    }

    radarChart.update();
}

function updateShotGraph(shotsData, teamColour) {
    if (!shotGraph) {
        console.error('Bar graph is not initialized');
        return;
    }
    if (!shotsData || shotsData.length === 0) {
        console.error('No shot data provided');
        return;
    }

    shotsData.sort((a, b) => parseInt(b.shot_total) - parseInt(a.shot_total));

    const shotTypes = shotsData.map(shot => 
        shot.shotType.charAt(0).toUpperCase() + shot.shotType.slice(1)
    );
    const shotCounts = shotsData.map(shot => parseInt(shot.shot_total));
    const goalCounts = shotsData.map(shot => parseInt(shot.scoring_total));
    
    shotGraph.data.labels = shotTypes;
    shotGraph.data.datasets = [
        {
            label: 'On Goal',
            data: shotCounts,
            backgroundColor: teamColour + '33',
            borderColor: 'black',
            borderWidth: 1
        },
        {
            label: 'Goals',
            data: goalCounts,
            backgroundColor: teamColour + '99',
            borderColor: 'black',
            borderWidth: 1
        }
    ];

    shotGraph.options.scales = {
        x: {
            stacked: true,
            beginAtZero: true
        },
        y: {
            stacked: true
        }
    };

    shotGraph.update();
}

function updateContractGraph(salaryData, teamColour) {
    if (!contractGraph) {
        console.error('contractGraph is not initialized');
        return;
    }
    if (!Array.isArray(salaryData) || salaryData.length === 0) {
        console.error('No salary data provided or salary data is empty');
        return;
    }

    contractGraph.data.datasets[0].backgroundColor = teamColour;

    const currentYear = new Date().getFullYear();
    const BASE_YEAR = Math.min(...salaryData.map(data => parseInt(data.Year)));
    const currentYearIndex = currentYear - BASE_YEAR;
    const totalValueData = salaryData.map(yearData => yearData.Total_Salary);
    const currentYearData = totalValueData.slice(0, currentYearIndex);
    const futureYearData = totalValueData.slice(currentYearIndex);

    contractGraph.data.datasets[0].data = currentYearData.concat(new Array(futureYearData.length).fill(0));
    contractGraph.data.datasets[1].data = new Array(currentYearData.length).fill(0).concat(futureYearData);
    contractGraph.data.labels = salaryData.map(yearData => yearData.Year);
    
    contractGraph.update();
}

// Main update function that calls all individual update functions
function updateCharts(playerData, shotsData, teamColour, salaryData) {
    updateRadarChart(playerData, teamColour);
    updateShotGraph(shotsData, teamColour);
    updateContractGraph(salaryData, teamColour);
}

// Make functions available globally
window.updateCharts = updateCharts;
window.updateRadarChart = updateRadarChart;
window.updateShotGraph = updateShotGraph;
window.updateContractGraph = updateContractGraph;