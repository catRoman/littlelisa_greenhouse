import { Highcharts} from 'highcharts';

var tempChart = null;
var humidityChart = null;


/**
 * highcharts
 */
document.addEventListener('DOMContentLoaded', function () {
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
            type: 'datetime'
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
            type: 'datetime'
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


/**
 * Initialize functions here.
 */
$(document).ready(function(){
    startDHTSensorInterval();
});


/** Sets the interval for getting the updated DHT22 */
function startDHTSensorInterval()
{
    setInterval(function(){
        fetchDHTSensorValues();
        var inside_temp = parseInt(document.getElementById('temperature_reading').innerText, 10);
        var inside_humidity = parseInt(document.getElementById('humidity_reading').innerText, 10);
        var currentTime = (new Date()).getTime();
        if (tempChart != null){
            tempChart.series[0].addPoint([currentTime, inside_temp], false);
            tempChart.redraw();
        }
        if (humidityChart != null){
            humidityChart.series[0].addPoint([currentTime, inside_humidity], false);
            humidityChart.redraw();
        }
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

        document.getElementById("temperature_reading").textContent = data.temp;
        document.getElementById("humidity_reading").textContent = data.humidity;

        humidityChart.series[0].addPoint(data.humidity);
        tempChart.series[0].addPoint(data.temp);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
