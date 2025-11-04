import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Filler, Title, Tooltip, Legend} from "chart.js";
import { Line, Bar, Pie, Doughnut, PolarArea, Radar } from "react-chartjs-2";
import { Colors } from "../../utilities/index";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Filler,
    Title,
    Tooltip,
    Legend
);

// chart legend
const legendOptions = {
    position: 'top',
    labels: {
        boxWidth: 12,
        boxHeight: 12,
        color: Colors.bodyColor,
        padding: 10,
    }
}

// chart tooltip
const tooltipOptions = {
    padding: 12,
    boxWidth: 10,
    boxHeight: 10,
    boxPadding: 6,
    backgroundColor: Colors.gray100,
    titleColor: Colors.gray900,
    bodyColor: Colors.bodyColor,
    borderColor: Colors.gray200,
    borderWidth: 1
}


// line chart
export const ChartLine = ({data, ...props}) => {
    let setData = data;
    let chartLegend = (typeof setData.legend === 'undefined') ? false : setData.legend;
    let TicksValue = (typeof setData.ticksValue === 'undefined') ? false : setData.ticksValue;
    let maxTicksLimitValue = setData.maxTicksLimit;

    let borderDashValue = setData.borderDash;
    let xAxisValue = (typeof setData.xAxis === 'undefined') ? true : setData.xAxis;
    let yAxisValue = (typeof setData.yAxis === 'undefined') ? true : setData.yAxis;

    let xGridColorValue = (typeof setData.xGridColor === 'undefined') ? Colors.gray100 : setData.xGridColor;
    let yGridColorValue = (typeof setData.yGridColor === 'undefined') ? Colors.gray100 : setData.yGridColor;
    let xGridBorderColorValue = (typeof setData.xGridBorderColor === 'undefined') ? Colors.gray100 : setData.xGridBorderColor;
    let yGridBorderColorValue = (typeof setData.yGridBorderColor === 'undefined') ? Colors.gray100 : setData.yGridBorderColor;

    return (
        <Line
            data={data}
            options={{
                plugins: {
                    legend: {
                        display: chartLegend,
                        ...legendOptions
                    },
                    tooltip: {
                        enabled: true,
                        ...tooltipOptions
                    },
                },
                interaction: {
                    mode: 'nearest',
                },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: xAxisValue,
                        grid: {
                            color: xGridColorValue,
                            borderColor: xGridBorderColorValue,
                            borderDash: borderDashValue,
                        },
                        ticks: {
                            color: "#9CA3AF", 
                            beginAtZero: true,
                            maxTicksLimit: maxTicksLimitValue,
                            font: {
                                size: "11px",
                                weight: "400"
                            }
                        }
                    },
                    y: {
                        display: yAxisValue,
                        grid: {
                            color: yGridColorValue,
                            borderColor: yGridBorderColorValue,
                            borderDash: borderDashValue,
                        },
                        ticks: {
                            // Include a ticks value in the ticks
                            callback: function(value) {
                              return value + TicksValue;
                            },
                            color: "#9CA3AF",
                            beginAtZero: true,
                            maxTicksLimit: maxTicksLimitValue,
                            font: {
                                size: "11px",
                                weight: "400"
                            }
                        }
                    },
                },
            }}
        />
    )
}

// bar chart
export const ChartBar = ({data, ...props}) => {
    let setData = data;
    let chartLegend = (typeof setData.legend === 'undefined') ? false : setData.legend;
    let TicksValue = (typeof setData.ticksValue === 'undefined') ? false : setData.ticksValue;
    let maxTicksLimitValue = setData.maxTicksLimit;

    let borderDashValue = setData.borderDash;
    let stackedValue = (typeof setData.stacked === 'undefined') ? false : setData.stacked;
    let xAxisValue = (typeof setData.xAxis === 'undefined') ? true : setData.xAxis;
    let yAxisValue = (typeof setData.yAxis === 'undefined') ? true : setData.yAxis;

    let xGridColorValue = (typeof setData.xGridColor === 'undefined') ? Colors.gray100 : setData.xGridColor;
    let yGridColorValue = (typeof setData.yGridColor === 'undefined') ? Colors.gray100 : setData.yGridColor;
    let xGridBorderColorValue = (typeof setData.xGridBorderColor === 'undefined') ? Colors.gray100 : setData.xGridBorderColor;
    let yGridBorderColorValue = (typeof setData.yGridBorderColor === 'undefined') ? Colors.gray100 : setData.yGridBorderColor;

    let barPercentageValue = (typeof setData.barPercentage === 'undefined') ? 0.4 : setData.barPercentage;
    let categoryPercentageValue = (typeof setData.categoryPercentage === 'undefined') ? 0.5 : setData.categoryPercentage;
    let barThicknessValue = (typeof setData.barThickness === 'undefined') ? 'flex' : setData.barThickness;

    return (
        <Bar 
            data={data}
            options={{
                categoryPercentage: barPercentageValue,
                barPercentage: categoryPercentageValue,
                barThickness: barThicknessValue,
                plugins: {
                    legend: {
                        display: chartLegend,
                        ...legendOptions
                    },
                    tooltip: {
                        enabled: true,
                        ...tooltipOptions
                    },
                },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: stackedValue,
                        display: xAxisValue,
                        grid: {
                            color: xGridColorValue,
                            borderColor: xGridBorderColorValue,
                            borderDash: borderDashValue,
                        },
                        ticks: {
                            color: "#9CA3AF", 
                            beginAtZero: true,
                            maxTicksLimit: maxTicksLimitValue,
                            font: {
                                size: "11px",
                                weight: "400"
                            }
                        }
                    },
                    y: {
                        stacked: stackedValue,
                        display: yAxisValue,
                        grid: {
                            color: yGridColorValue,
                            borderColor: yGridBorderColorValue,
                            borderDash: borderDashValue,
                        },
                        ticks: {
                            // Include a ticks value in the ticks
                            callback: function(value) {
                              return value + TicksValue;
                            },
                            color: "#9CA3AF",
                            beginAtZero: true,
                            maxTicksLimit: maxTicksLimitValue,
                            font: {
                                size: "11px",
                                weight: "400"
                            }
                        }
                    },
                },
            }}
        />
    )
}

// pie chart
export const ChartPie = ({data, ...props}) => {
    let setData = data;
    let chartLegend = (typeof setData.legend === 'undefined') ? false : setData.legend;
    return (
        <Pie 
        data={data} 
        options={{
            plugins: {
                legend: {
                  display: chartLegend,
                  ...legendOptions,
                },
                tooltip: {
                  enabled:true,
                  ...tooltipOptions,
                },
              },
              responsive: true,
              maintainAspectRatio:false,
        }} />
    )
}

// doughnut chart
export const ChartDoughnut = ({data, ...props}) => {
    let setData = data;
    let chartLegend = (typeof setData.legend === 'undefined') ? false : setData.legend;

    return (
        <Doughnut 
        data={data} 
        options={{
            plugins: {
                legend: {
                  display: chartLegend,
                  ...legendOptions,
                },
                tooltip: {
                  enabled:true,
                  ...tooltipOptions,
                },
              },
              responsive: true,
              maintainAspectRatio:false,
        }} />
    )
}

// Polar chart
export const ChartPolar = ({data, ...props}) => {
    let setData = data;
    let chartLegend = (typeof setData.legend === 'undefined') ? false : setData.legend;

    return (
        <PolarArea 
        data={data} 
        options={{
            plugins: {
                legend: {
                  display: chartLegend,
                  ...legendOptions,
                },
                tooltip: {
                  enabled:true,
                  ...tooltipOptions,
                },
              },
              responsive: true,
              maintainAspectRatio:false,
        }} />
    )
}

// Radar chart
export const ChartRadar = ({data, ...props}) => {
    let setData = data;
    let chartLegend = (typeof setData.legend === 'undefined') ? false : setData.legend;
    let TicksValue = (typeof setData.ticksValue === 'undefined') ? false : setData.ticksValue;
    let borderDashValue = setData.borderDash;
    let xAxisValue = (typeof setData.xAxis === 'undefined') ? true : setData.xAxis;
    let yAxisValue = (typeof setData.yAxis === 'undefined') ? true : setData.yAxis;

    let xGridColorValue = (typeof setData.xGridColor === 'undefined') ? Colors.gray100 : setData.xGridColor;
    let yGridColorValue = (typeof setData.yGridColor === 'undefined') ? Colors.gray100 : setData.yGridColor;
    let xGridBorderColorValue = (typeof setData.xGridBorderColor === 'undefined') ? Colors.gray100 : setData.xGridBorderColor;
    let yGridBorderColorValue = (typeof setData.yGridBorderColor === 'undefined') ? Colors.gray100 : setData.yGridBorderColor;

    let pointLabelsValue = (typeof setData.pointLabels === 'undefined') ? true : setData.pointLabels;
    let ticksNumberLabelValue = (typeof setData.ticksNumberLabel === 'undefined') ? true : setData.ticksNumberLabel;

    return (
        <Radar 
        data={data} 
        options={{
            plugins: {
                legend: {
                  display: chartLegend,
                  ...legendOptions,
                },
                tooltip: {
                  enabled:true,
                  ...tooltipOptions,
                },
              },
              responsive: true,
              maintainAspectRatio:false,
              scales: {
                r: {
                    pointLabels: {
                        display: pointLabelsValue // Hides the labels around the radar chart 
                    },
                    ticks: {
                        display: ticksNumberLabelValue // Hides the labels in the middel (numbers)
                    }
                },
                x: {
                    display: xAxisValue,
                    grid: {
                        color: xGridColorValue,
                        borderColor: xGridBorderColorValue,
                        borderDash: borderDashValue,
                    },
                    ticks: {
                        color: Colors.bodyColor, 
                        beginAtZero: true,
                        font: {
                            size: "11px",
                            weight: "400"
                        }
                    }
                },
                y: {
                    display: yAxisValue,
                    grid: {
                        color: yGridColorValue,
                        borderColor: yGridBorderColorValue,
                        borderDash: borderDashValue,
                    },
                    ticks: {
                        // Include a ticks value in the ticks
                        callback: function(value) {
                          return value + TicksValue;
                        },
                        color: Colors.bodyColor,
                        beginAtZero: true,
                        font: {
                            size: "11px",
                            weight: "400"
                        }
                    }
                },
            },
        }} />
    )
}