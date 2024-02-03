/**
 * gle.com66
 * Add gobals here
 */
//TODO: remove jquery and update functions to modern js
//TODO: implement dynamic page using REACT based on sensors available
//TODO display more device info such as mac adress etc
//TODO: fix OTA so that it says the filename of last update-might ned to save it to nvs and retrieve
// TODO add password protection to page, store password on nvs
//TODO make page https


var seconds 	= null;
var otaTimerVar =  null;
var wifiConnectInterval = null;
var tempChart = null;
var humidityChart = null;
/**
 * highcharts
 
document.addEventListener('DOMContentLoaded', function () {
    var tempchartOptions = {
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
    var humiditychartOptions = {
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

    humidityChart = Highcharts.chart(humiditychartOptions);
    tempChart = Highcharts.chart(tempchartOptions);
});

*/
/**
 * Initialize functions here.
 */
$(document).ready(function(){
	getUpdateStatus();
    startDHTSensorInterval();
    getConnectInfo();
    $("#connect_wifi").on("click", function(){
        checkCredentials();
    });

    $("#disconnect_wifi").on("click", function(){
        disconnectWifi();
    });
});   

/**
 * Gets file name and size for display on the web page.
 */        
function getFileInfo() 
{
    var x = document.getElementById("selected_file");
    var file = x.files[0];

    document.getElementById("file_info").innerHTML = "<h4>File: " + file.name + "<br>" + "Size: " + file.size + " bytes</h4>";
}

/**
 * Handles the firmware update.
 */
function updateFirmware() 
{
    // Form Data
    var formData = new FormData();
    var fileSelect = document.getElementById("selected_file");
    
    if (fileSelect.files && fileSelect.files.length == 1) 
	{
        var file = fileSelect.files[0];
        formData.set("file", file, file.name);
        document.getElementById("ota_update_status").innerHTML = "Uploading " + file.name + ", Firmware Update in Progress...";

        // Http Request
        var request = new XMLHttpRequest();

        request.upload.addEventListener("progress", updateProgress);
        request.open('POST', "/OTAupdate");
        request.responseType = "blob";
        request.send(formData);
    } 
	else 
	{
        window.alert('Select A File First')
    }
}

/**
 * Progress on transfers from the server to the client (downloads).
 */
function updateProgress(oEvent) 
{
    if (oEvent.lengthComputable) 
	{
        getUpdateStatus();
    } 
	else 
	{
        window.alert('total size is unknown')
    }
}

/**
 * Posts the firmware udpate status.
 */
function getUpdateStatus() 
{
    var xhr = new XMLHttpRequest();
    var requestURL = "/OTAstatus";
    xhr.open('POST', requestURL, false);
    xhr.send('ota_update_status');

    if (xhr.readyState == 4 && xhr.status == 200) 
	{		
        var response = JSON.parse(xhr.responseText);
						
	 	document.getElementById("latest_firmware").innerHTML = response.compile_date + " - " + response.compile_time

		// If flashing was complete it will return a 1, else -1
		// A return of 0 is just for information on the Latest Firmware request
        if (response.ota_update_status == 1) 
		{
    		// Set the countdown timer time
            seconds = 10;
            // Start the countdown timer
            otaRebootTimer();
        } 
        else if (response.ota_update_status == -1)
		{
            document.getElementById("ota_update_status").innerHTML = "!!! Upload Error !!!";
        }
    }
}

/**
 * Displays the reboot countdown.
 */
function otaRebootTimer() 
{	
    document.getElementById("ota_update_status").innerHTML = "OTA Firmware Update Complete. This page will close shortly, Rebooting in: " + seconds;

    if (--seconds == 0) 
	{
        clearTimeout(otaTimerVar);
        window.location.reload();
    } 
	else 
	{
        otaTimerVar = setTimeout(otaRebootTimer, 1000);
    }
}

/**
 * Get the DHT22 inside sensor temperature and humidity values for display on
 * the webpage
 */
function getDHTInsideSensorValues(){
    $.getJSON('/dhtInsideSensor.json', function(data) {
        $("#inside_system_time").text(data["system time"]);
        $("#inside_temperature_reading").text(data["temperature"]);
        $("#inside_humidity_reading").text(data["humidity"]);

        // Get the current time
        var now = new Date();

        // Format the time - e.g., 'Jan 12, 2024, 15:45:30'
        var formattedTime = now.toLocaleString(); 

    });
}

/**
 * Get the DHT22 outside sensor temperature and humidity values for display on
 * the webpage
 */
function getDHTOutsideSensorValues(){
    $.getJSON('/dhtOutsideSensor.json', function(data) {
        $("#outside_temperature_reading").text(data["temperature"]);
        $("#outside_humidity_reading").text(data["humidity"]);
        $("#outside_system_time").text(data["system time"]);
        // Get the current time
        var now = new Date();

        // Format the time - e.g., 'Jan 12, 2024, 15:45:30'
        var formattedTime = now.toLocaleString(); 

    });
}

/** Sets the interval for getting the updated DHT22 */
function startDHTSensorInterval()
{
    setInterval(getDHTInsideSensorValues, 5000);
    setInterval(getDHTOutsideSensorValues, 5000);
    
    setInterval(function(){
        var inside_temp = parseInt(document.getElementById('inside_temperature_reading').innerText, 10);
        var inside_humidity = parseInt(document.getElementById('inside_humidity_reading').innerText, 10);
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
 * Clears the connection staus interval
 */
function stopWifiConnectStatusInterval()
{
    if(wifiConnectInterval != null)
    {
        clearInterval(wifiConnectInterval);
        wifiConnectInterval = null;
    }
}

/**
 * Gets the WiFi connection status
 */
function getWifiConnectStatus()
{
    var xhr = new XMLHttpRequest();
    var requestURL = "/wifiConnectStatus.json";
    xhr.open('POST', requestURL, false);
    xhr.send('wifi_connect_status');

    
    if (xhr.readyState == 4 && xhr.status == 200)
    {
        var response = JSON.parse(xhr.responseText);
    
        document.getElementById("wifi_connect_status").innerHTML = "<h4 class=\"gr\">Connecting... </h4>";
        
        
        if(response.wifi_connect_status == 1){
            document.getElementById("wifi_connect_status").innerHTML = 
                "<h4 class=\"rd\">Failed to connect. Check your ap credientials and compadibility.</h4>";
                stopWifiConnectStatusInterval();
        }
        else if(response.wifi_connect_status == 2){
            document.getElementById("wifi_connect_status").innerHTML = 
                "<h4 class=\"gr\">Connection Successful</h4>";
                stopWifiConnectStatusInterval();
                getConnectInfo();
                //update the webpage
                setTimeout(function() {
                    document.getElementById("wifi_connect_status").innerHTML = "";
                    document.getElementById("connect_ssid").value = "";
                    document.getElementById("connect_pass").value = "";
                }, 5000);
        }
        
    }

}

/**
 * Starts the interval for checking the connection status
 */
function startWifiConnectStatusInterval()
{
    wifiConnectInterval = setInterval(getWifiConnectStatus, 2800);
}
/**
 * Connect Wifi function called using the SSID and password entered in the text fields
 * 
 */
function connectWifi()
{
    //get the SSID and password
    selectedSSID = $("#connect_ssid").val();
    pwd = $("#connect_pass").val();

    $.ajax({
        url: '/wifiConnect.json',
        dataType: 'json',
        method: 'POST',
        cache: false,
        headers: {'my-connect-ssid': selectedSSID, 'my-connect-pwd': pwd},
        data: {'timestamp': Date.now()}
    });

    startWifiConnectStatusInterval();
}
/**
 * Checks credentials on connect_wifi button clicks:
 */
function checkCredentials()
{
    errorList = "";
    credsOk = true;

    selectedSSID = $("#connect_ssid").val();
    pwd = $("#connect_pass").val();

    if (selectedSSID == "")
    {
        errorList += "<h4 class='rd'>SSID cannot be empty!</h4>";
        credsOk = false;
    }
    
    if (pwd == "")
    {
        errorList += "<h4 class='rd'>Password cannot be empty!</h4>";
        credsOk = false;
    }

    if (credsOk == false)
    {
        $("#wifi_connect_credentials_errors").html(errorList);
    }
    else
    {
        $("#wifi_connect_credentials_errors").html("");
        connectWifi();
    }
}
/**
 * show the wifi password is the box is checked
 */
function showPassword()
{
    var x = document.getElementById("connect_pass");
    if (x.type == "password") 
    {
        x.type = "text";
    }  
    else
    {
        x.type = "password";
    }
}

/**
 * Gets the connection information for displaying on the web page
 */
function getConnectInfo()
{
    $.getJSON('/wifiConnectInfo.json', function(data)
    {
        $("#connected_ap_label").html("Connected to: ");
        $("#connected_ap").text(data["ap"]);

        $("#ip_address_label").html("IP Address: ");
        $("#wifi_connect_ip").text(data["ip"]);

        $("#netmask_label").html("Netmask: ");
        $("#wifi_connect_netmask").text(data["netmask"]);

        $("#gateway_label").html("Gateway: ");
        $("#wifi_connect_gw").text(data["gw"]);

        document.getElementById('disconnect_wifi').style.display = 'block';
    })
}

/**
 * Disconnects WiFi once the disconnect button is pressed and reloads the web page
 */
function disconnectWifi()
{
    $.ajax({
        url: '/wifiDisconnect.json',
        dataType: 'json',
        method: 'DELETE',
        cache: false,
        data: {'timestamp': Date.now()}
    });
    //update the webpage
    setTimeout(function() {
        location.reload(true);
    }, 2000);
}

