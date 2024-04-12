(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&s(l)}).observe(document,{childList:!0,subtree:!0});function t(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(n){if(n.ep)return;n.ep=!0;const r=t(n);fetch(n.href,r)}})();const m=document.querySelector(".header-menu-icon"),g=document.querySelector(".menu"),C=document.querySelector("main");document.querySelector(".nav-btn.close");const k=document.querySelectorAll(".nav-btn");document.querySelector(".network-info");document.querySelector(".sensor-data-node-box");document.querySelector(".section-sensor-data");const y=document.querySelector(".log-output"),_=document.querySelector(".log-refresh");let i,h=[];const p=new Set(null);let f="node",b;k.forEach(o=>{o.addEventListener("touchend",function(e){e.stopPropagation;const t=[...this.classList];switch(t[t.length-1]){case"dev_btn":c(".device-info");break;case"net_btn":c(".network-info");break;case"db_btn":c(".sd-db-info");break;case"sys_btn":c(".system-health");break;case"ota_btn":c(".ota-update");break;case"close":S();break}})});_.addEventListener("touchend",o=>{i!==void 0&&(i.close(),console.log("refreshing log socket..."),y.value="Refreshing esp log stream...",setTimeout(()=>$(b),3e3))});m.addEventListener("touchend",()=>{S()});function S(){m.classList.toggle("invisible"),C.classList.toggle("invisible"),g.classList.toggle("hidden"),document.body.classList.toggle("overflow-hide"),document.documentElement.classList.toggle("overflow-hide"),document.querySelector("main").classList.toggle("body-disabled"),setTimeout(()=>document.querySelector("main").classList.toggle("body-disabled"),100)}function c(o){const e=document.querySelector(o);g.classList.toggle("hidden"),e.classList.toggle("hidden"),e.addEventListener("touchend",()=>c(o))}function E(o){const e=document.querySelector(`${o} > .sensor-summary`);e.addEventListener("click",function(t){(t.target===this||this.contains(t.target))&&(e.nextElementSibling.classList.toggle("hidden"),e.querySelector(".node-title").classList.toggle("green"))})}async function v(){try{const o=await fetch("/api/uptimeFunk.json");if(!o.ok)throw new Error("Network response was not ok");const e=await o.json();H(e)}catch(o){console.error("Error:",o)}}async function T(){try{const o=await fetch("/api/moduleInfo.json");if(!o.ok)throw new Error("Network response was not ok");const e=await o.json();f=e.module_info.type.toLowerCase(),b=e,D(e),w(a(e.module_info.identifier),e),$(e),I(e),f==="controller"&&q()}catch(o){console.error("Error:",o)}}async function N(){try{const o=await fetch("/api/controllerStaList.json");if(!o.ok)throw new Error("Network response was not ok");const e=await o.json();h=Object.keys(e.sta_list),O(e)}catch{}}function O(o){const{sta_list:e}=o;Object.entries(e).forEach(([t,s])=>{const n=a(t);(async function(){try{const l=await fetch(`http://littlelisa-${n}.local/api/moduleInfo.json`);if(l.ok){const u=await l.json();document.querySelector(`.${n}`)===null&&(w(n,u),A(n,u,s),p.add(t)),j(n,s)}else console.error(`${n} not a node`,error)}catch{}})()})}function A(o,e,t){const{module_info:{location:s,identifier:n}}=e;document.querySelector(".online-connections > .inside").insertAdjacentHTML("beforeend",`<a href="http://littlelisa-${o}.local"
        ><button class="online-connection-btn ${o}-btn">
          <h2 class="node-title">${n}</h2>
          <div class="loc-rssi">
            <p class="location">${s}</p>
            <p class="rssi">${t}</p>
          </div>
        </button></a
        >`)}function w(o,e){const{module_info:{type:t,location:s,identifier:n},sensor_list:r}=e;document.querySelector(`.${o}`)!==null?document.querySelector(`.${o}`):document.querySelector(".section-sensor-data").insertAdjacentHTML("beforeend",` <!-- NODE- ${o}-->
      <div class="sensor-data-node-box ${o}">
        <div class="sensor-summary">
          <div class="sensor-data-info">
            <h2 class="node-title">Node Id</h2>
            <p class="location">Module Location</p>
          </div>
          <div class='value-avg-box'>
          <p>avg.</p> <p><span class="sensor-avg">--</span>°C</p>
          </div>
          </div>
        <ul class="sensor-types hidden">
          <li class="sensor-type DHT22">
            <p class="subheading">DHT22</p>

            <ul class="sensor-readings-box">

            </ul>
          </li>
          <li class="sensor-type hidden soil_moisture">
            <p class="subheading">Soil Moisture</p>
            <ul class="sensor-readings-box"></ul>
          </li>
          <li class="sensor-type hidden light">
            <p class="subheading">Light</p>
            <ul class="sensor-readings-box"></ul>
          </li>
          <li class="sensor-type hidden sound">
            <p class="subheading">Sound</p>
            <ul class="sensor-readings-box"></ul>
          </li>
          <li class="sensor-type hidden movement">
            <p class="subheading">Movement</p>
            <ul class="sensor-readings-box"></ul>
          </li>
          <li class="sensor-type hidden cam">
            <p class="subheading">Cam</p>
            <ul class="sensor-readings-box"></ul>
          </li>
        </ul>
      </div>`);const l=document.querySelector(`.${o}`);l.querySelector(".sensor-data-info > h2").textContent=n,l.querySelector(".sensor-data-info > .location").textContent=t.toUpperCase(),l.querySelector(".sensor-data-info > .location").style.color="#ee5b5b",Object.entries(r).forEach(([u,x])=>{for(let d=1;d<=x;d++)l.querySelector(`.${u} > ul`).insertAdjacentHTML("beforeend",`<!-- SENSOR-${d}-->
          <li class="sensor-reading local-sensor-${d}">
    <p class="timestamp">----</p>
    <div class="sensor-location-pin-header">

      <p class="sub-label location-label">
        Location:
        </p>
        <span class="sensor-location">---</span>

      <p class="sub-label pin">
        Pin:
        <span class="sensor-pin">--</span>
      </p>
    </div>

    <p class="sensor-id">
      Sensor <span class="local-sensor-id">${d}</span>:
    </p>
    <div class="values">
      <p><span class="sensor-value temp">--</span> &deg;C</p> &xhArr;
      <p><span class="sensor-value hum">--</span> %</p>
    </div>
  </li>`)}),E(`.${o}`)}function q(){N(),M()}function D(o){const{module_info:{type:e,location:t,identifier:s}}=o;document.querySelector(".type").textContent=e,document.querySelector(".module_id").textContent=s,document.querySelector(".title-location").textContent=t}function j(o,e){const t=document.querySelector(`.${o}-btn .rssi`);e>-50?t.style.backgroundColor="green":e<-50&&e>-70?t.style.backgroundColor="yellow":e<-70?t.style.backgroundColor="red":e<-100&&(t.style.backgroundColor="grey"),t.textContent=`${e}`}function M(){p.forEach(o=>{const e=a(o);!h.includes(o)&&document.querySelector(`.${e}`)!==null&&(document.querySelector(`.${e}`).remove(),document.querySelector(`.${e}-btn`).remove(),p.delete(o),console.log(`removed ${e}`))})}function H({uptime:o}){const e=[Math.floor(o/864e5),Math.floor(o%864e5/36e5),Math.floor(o%36e5/6e4),Math.floor(o%6e4/1e3)].map(t=>t.toString().padStart(2,"0"));document.querySelector(".uptime").textContent=`${e[0]} : ${e[1]} : ${e[2]} : ${e[3]}`}function B(o){const{module_info:e,sensor_data:t}=o,s=a(e.module_id),l=document.querySelector(`.${s}`).querySelector(`.${t.sensor_type}`).querySelector(`.local-sensor-${e.local_sensor_id}`);l.querySelector(".timestamp").textContent=t.timestamp,l.querySelector(".sensor-location").textContent=t.location,l.querySelector(".sensor-pin").textContent=t.module_pin,l.querySelector(".temp").textContent=`${t.sensor_data.temp.toFixed(2)}`,l.querySelector(".hum").textContent=`${t.sensor_data.humidity.toFixed(2)}`}function L(){document.querySelectorAll(".sensor-data-node-box").forEach(e=>{const t=e.querySelectorAll(".temp"),n=Array.from(t).reduce((r,l)=>r+Number(l.textContent),0)/t.length;e.querySelector(".sensor-avg").textContent=n.toFixed(2)})}function I(o){const{module_info:{type:e,identifier:t}}=o;let s=a(t);s=e+s.substring(s.indexOf("-")),console.log(s);const n=new WebSocket(`ws://littlelisa-${s}.local:8080/ws/sensor`);n.onopen=function(){console.log("sensor Data websocket connection established")},n.onmessage=r=>{B(JSON.parse(r.data.replace(/\0+$/,"")))}}function $(o){const{module_info:{type:e,identifier:t}}=o;let s=a(t);s=e+s.substring(s.indexOf("-")),console.log(s),i=new WebSocket(`ws://littlelisa-${s}.local:8080/ws/log`),i.onopen=function(){console.log("log data websocket connection established"),console.log("starting log in  5 seconds"),setTimeout(function(){i.send("start log")},5e3)},i.onmessage=n=>{R(n.data)},window.addEventListener("beforeunload",function(){i.send("stop log"),i.send(""),sensorDataSocket.send("")})}function R(o){const t=document.querySelector(".log-output"),s=t.scrollHeight-t.clientHeight<=t.scrollTop+1;if(t.value+=(t.value?`
`:"")+P(o),t.value.length>1e5){let n=t.value.length-1e5,r=t.value.substring(n);t.value=`...[truncated]...
`+r}s&&(t.scrollTop=t.scrollHeight)}function P(o){let e=o.substring(o.indexOf("("));return e=e.substring(0,e.indexOf("[")-1),e}y.addEventListener("touchstart",o=>o.preventDefault());function a(o){return"node-"+o.replaceAll(":","_")}window.addEventListener("resize",()=>{console.log(`Viewport Width: ${window.innerWidth}, Viewport Height: ${window.innerHeight}`)});console.log(`Initial Viewport Width: ${window.innerWidth}, Initial Viewport Height: ${window.innerHeight}`);T();L();v();f.toLowerCase()==="controller"&&setInterval(q,15e3);setInterval(L,5e3);setInterval(v,5e3);
