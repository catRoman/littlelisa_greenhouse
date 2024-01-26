
var tempChart = null;
var humidityChart = null;


/**
 * Initialize functions
 */

document.addEventListener('DOMContentLoaded', function () {

    startDHTSensorInterval();
    var tempChartOptions = {
        chart: {
            renderTo: 'temp_chart',
            type: 'line'
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'Temperature'
        },
        xAxis: {
            type: 'datetime',
            labels: {
                format: '{value:%Y-%m-%d}'
            },
        },
        yAxis: {
            title: {
                text: 'Readings'
            }
        },
        series: [{
            type: 'line',
            name: 'Inside Temperature',
            data: []
        }]
    }
    var humidityChartOptions = {
        chart: {
            renderTo: 'humidity_chart',
            type: 'line'
        },
        credits: {
            enabled: false
        },
        plotOptions : {
            line : {
                marker: {
                    enabled: true
                }
            }
        },
        title: {
            text: 'Humidity'
        },
        xAxis: {
            type: 'datetime',
            allowDecimals: false,
        },

        yAxis: {
            title: {
                text: 'Readings'
            }
        },
        series: [{
            type: 'line',
            name: 'Inside Humidity',
            data: []
        }]
    }

    humidityChart = Highcharts.chart(humidityChartOptions);
    tempChart = Highcharts.chart(tempChartOptions);
});


/** Sets the interval for getting the updated DHT22 */
function startDHTSensorInterval()
{
    setInterval(function(){
        fetchDHTSensorValues();
        var inside_temp = parseFloat(document.getElementById('temperature_reading').innerText, 10);
        var inside_humidity = parseFloat(document.getElementById('humidity_reading').innerText, 10);

    }, 5000)
}


/**
 * Gest the DHT22 sensor temperature and humidity values for display on
 * the webpage
 */
async function fetchDHTSensorValues(){
    try {
        const response = await fetch("/api/dhtData.json");
        const data = await response.json();

        const timeStamp = new Date(data.server_info.epoch).getTime();


        document.getElementById("temperature_reading").textContent = data.temperature.toFixed(2);
        document.getElementById("humidity_reading").textContent = data.humidity.toFixed(2);

        if (tempChart != null){
        tempChart.series[0].addPoint([timeStamp, Number(data.temperature.toFixed(2))], false);
            tempChart.redraw();
        }
        if (humidityChart != null){
            humidityChart.series[0].addPoint([timeStamp, Number(data.humidity.toFixed(2))], false);
            humidityChart.redraw();
        }
//        humidityChart.series[0].addPoint(data.humidity);
//        tempChart.series[0].addPoint(data.temperature);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
