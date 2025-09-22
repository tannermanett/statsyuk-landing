let standingsChart;

const hoverEffectPlugin = {
    id: 'hoverEffect',
    beforeEvent(chart, args) {
        if (args.event.type !== 'mousemove') return;

        const activeElements = chart.getActiveElements();
        const newHoveredIndex = activeElements.length ? activeElements[0].datasetIndex : null;

        if (chart.hoveredIndex === newHoveredIndex) return; // Prevent unnecessary updates
        chart.hoveredIndex = newHoveredIndex;

        let requireUpdate = false;

        chart.data.datasets.forEach((dataset, index) => {
            const isActive = index === newHoveredIndex;
            const ogColour = dataset.originalBorderColor || dataset.borderColor;

            // Set border color based on hover state
            const newBorderColor = newHoveredIndex !== null
                ? (isActive ? hexToRGBA(ogColour, 1) : hexToRGBA(ogColour, 0.3))
                : ogColour;

            if (dataset.borderColor !== newBorderColor) {
                dataset.borderColor = newBorderColor;
                requireUpdate = true;
            }

            // Update logo size on hover or reset to normal
            if (dataset.logoImg) {
                const newScale = newHoveredIndex !== null
                    ? (isActive ? 1 : 0.5)  // Hover state: active = full size, others = small
                    : 1;                     // No hover state: all logos full size

                if (dataset.logoImg.scale !== newScale) {
                    dataset.logoImg.scale = newScale;
                    requireUpdate = true;
                }
            }
        });

        if (requireUpdate) {
            requestAnimationFrame(() => chart.update('none'));
        }
    }
};

const logoHandlePlugin = {
    id: 'logoRender',
    afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const hoveredIndex = chart.hoveredIndex;

        // First pass: Draw all non-hovered logos
        for (let index = chart.data.datasets.length - 1; index >= 0; index--) {
          if (index === hoveredIndex) continue; // Skip hovered logo
          drawLogo(chart, chart.data.datasets[index], index);
        }

        // Second pass: Draw hovered logo on top
        if (hoveredIndex !== null) {
            const hoveredDataset = chart.data.datasets[hoveredIndex];
            drawLogo(chart, hoveredDataset, hoveredIndex);
        }
    }
};

// Helper function to draw logo
function drawLogo(chart, dataset, index) {
    if (!chart || !dataset) {
        console.warn('Invalid chart or dataset');
        return;
    }

    const { ctx } = chart;
    const points = dataset.data;
    
    if (!points || !points.length) {
        console.warn('No data points found');
        return;
    }

    let lastValidIndex = points.length - 1;
    
    while (lastValidIndex >= 0 && points[lastValidIndex] === null) {
        lastValidIndex--;
    }

    if (lastValidIndex >= 0) {
        const meta = chart.getDatasetMeta(index);
        
        if (!meta || !meta.data || !meta.data[lastValidIndex]) {
            console.warn('Invalid meta data for dataset:', index);
            return;
        }

        const point = meta.data[lastValidIndex];
        
        if (point && dataset.logoImg) {
            const logoWidth = dataset.logoImg.width * (dataset.logoImg.scale || 1);
            const logoHeight = dataset.logoImg.height * (dataset.logoImg.scale || 1);
            
            // Calculate center position
            const x = point.x;  // Removed the -10 offset since we're using centerOffset
            const y = point.y;
            const logoY = y - (logoHeight / 2);

            ctx.save();
            
            // Center the logo horizontally relative to its size
            const centerOffset = logoWidth / 2;
            ctx.drawImage(
                dataset.logoImg,
                x - centerOffset,
                logoY,
                logoWidth,
                logoHeight
            );

            ctx.restore();
        }
    }
}

// Preload images
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.height = 35;
    img.width = 50;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

function hexToRGBA(hex, opacity) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function formatChartDate(dateString) {
  const date = new Date(dateString + "T08:00:00.000Z");
  const month = date.toLocaleString("default", { month: "short" });
  const day = date.getDate();
  const suffix = (day) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };
  return `${month} ${day}${suffix(day)}`;
}

function initializeStandingGraph() {
  document.addEventListener("DOMContentLoaded", async function () {
    const ctx = document
      .getElementById("standingsGraph")
      .getContext("2d", { willReadFrequently: true });

    standingsChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 30, right: 90, left: 10, bottom: 20 } },
        elements: {
          line: { tension: 0 },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: false,
            },
            ticks: {
              color: "black",
              autoSkip: false,
              maxRotation: 0,
              minTickslimit: 5,
              callback  (value, index, values) {  
                const checkVal = this.getLabelForValue(value);
                const date = new Date(checkVal + "T08:00:00.000Z");
                const day = date.getDate();
                if (day === 1 || day === 15) {
                  return formatChartDate(checkVal);
                } else {
                  return "";
                }
              }
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Points",
              color: "black",
              font: { size: 14 },
            },
            ticks: {
              color: "black",
              font: { size: 14 },
            },
          },
        },
        clip: false,
        interactions: {
          mode: "nearest",
          intersect: false,
          axis: 'xy',
        },
        plugins: {
          legend: { display: false },
          hover: { 
            mode: 'dataset',
            intersect: false,
           },
          tooltip: {
            position: "nearest",
            yAlign: "center",
            xAlign: "left",
            caretX: 10,
            caretPadding: 20,
          },
        },
      },
      plugins: [hoverEffectPlugin, logoHandlePlugin],
    });
  });
}

initializeStandingGraph();

function updateStandingsChart(data) {
  const allDates = new Set();
  data.forEach(team => {
    const pointsMap = new Map(
      team.points_array.map(entry => [entry.date, entry.points])
    );
    team.pointsMap = pointsMap; // Store for later use
    team.points_array.forEach(entry => allDates.add(entry.date));
  });

  let labels = Array.from(allDates).sort();
  const lastKnownDate = labels[labels.length - 1];


  const lastDate = new Date(lastKnownDate);
  const endDate = new Date('2025-04-17');

  let currentDate = new Date(lastDate);
  currentDate.setDate(currentDate.getDate() + 1); // Start from next day

  while (currentDate <= endDate) {
    labels.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Sort all dates including the new ones
  labels = labels.sort();

  const chartData = data.map((team) => {
    const logoImg = new Image();
    logoImg.src = team.teamLogo;
    logoImg.height = 28;
    logoImg.width = 40;

    const pointsData = [];
    let lastKnownPoints = 0;

    labels.forEach((date) => {
        if (date <= lastKnownDate) {
          // For dates up to the last known date, use actual or last known points
          if (team.pointsMap.has(date)) {
            lastKnownPoints = Number(team.pointsMap.get(date));
          }
          pointsData.push(lastKnownPoints);
        } else {
          // For future dates, push null to create a gap in the line
          pointsData.push(null);
        }
    });

    return {
      label: team.teamAbbrev,
      data: pointsData,
      pointStyle: Array(labels.length).fill(false),
      logoImg: logoImg,
      borderColor: team.hex_codes.primary,
      originalBorderColor: team.hex_codes.primary,
      backgroundColor: team.hex_codes.primary,
      fill: false,
      spanGaps: false,
    };
  });

  standingsChart.data.labels = labels;
  standingsChart.data.datasets = chartData;

  standingsChart.update("none");
}

function startAnimation() {
    if(standingsChart) {
        animateChart();
    }else{
        setTimeout(startAnimation, 500);
    }
}

window.updateStandingsChart = updateStandingsChart;
