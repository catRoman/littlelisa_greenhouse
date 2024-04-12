(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))l(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&l(r)}).observe(document,{childList:!0,subtree:!0});function o(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function l(n){if(n.ep)return;n.ep=!0;const s=o(n);fetch(n.href,s)}})();const p=document.querySelector(".header-menu-icon"),f=document.querySelector(".menu"),w=document.querySelector("main");document.querySelector(".nav-btn.close");const q=document.querySelectorAll(".nav-btn");document.querySelector(".network-info");document.querySelector(".sensor-data-node-box");document.querySelector(".section-sensor-data");const L=document.querySelector(".log-output");let m=[];const u=new Set(null);q.forEach(t=>{t.addEventListener("touchend",function(e){e.stopPropagation;const o=[...this.classList];switch(o[o.length-1]){case"dev_btn":i(".device-info");break;case"net_btn":i(".network-info");break;case"db_btn":i(".sd-db-info");break;case"sys_btn":i(".system-health");break;case"ota_btn":i(".ota-update");break;case"close":g();break}})});p.addEventListener("touchend",()=>{g()});function g(){p.classList.toggle("invisible"),w.classList.toggle("invisible"),f.classList.toggle("hidden"),document.body.classList.toggle("overflow-hide"),document.documentElement.classList.toggle("overflow-hide"),document.querySelector("main").classList.toggle("body-disabled"),setTimeout(()=>document.querySelector("main").classList.toggle("body-disabled"),100)}function i(t){const e=document.querySelector(t);f.classList.toggle("hidden"),e.classList.toggle("hidden"),e.addEventListener("touchend",()=>i(t))}function $(t){const e=document.querySelector(`${t} > .sensor-summary`);e.addEventListener("click",function(o){(o.target===this||this.contains(o.target))&&(e.nextElementSibling.classList.toggle("hidden"),e.querySelector(".node-title").classList.toggle("green"))})}async function y(){try{const t=await fetch("/api/uptimeFunk.json");if(!t.ok)throw new Error("Network response was not ok");const e=await t.json();A(e)}catch(t){console.error("Error:",t)}}async function x(){try{const t=await fetch("/api/moduleInfo.json");if(!t.ok)throw new Error("Network response was not ok");const e=await t.json();E(e),h(a(e.module_info.identifier),e),j(e)}catch(t){console.error("Error:",t)}}async function C(){try{const t=await fetch("/api/controllerStaList.json");if(!t.ok)throw new Error("Network response was not ok");const e=await t.json();m=Object.keys(e.sta_list),k(e)}catch{}}function k(t){const{sta_list:e}=t;Object.entries(e).forEach(([o,l])=>{const n=a(o);(async function(){try{const r=await fetch(`http://littlelisa-${n}.local/api/moduleInfo.json`);if(r.ok){const d=await r.json();document.querySelector(`.${n}`)===null&&(h(n,d),_(n,d,l),u.add(o)),N(n,l)}else console.error(`${n} not a node`,error)}catch{}})()})}function _(t,e,o){const{module_info:{location:l,identifier:n}}=e;document.querySelector(".online-connections > .inside").insertAdjacentHTML("beforeend",`<a href="http://littlelisa-${t}.local"
        ><button class="online-connection-btn ${t}-btn">
          <h2 class="node-title">${n}</h2>
          <div class="loc-rssi">
            <p class="location">${l}</p>
            <p class="rssi">${o}</p>
          </div>
        </button></a
        >`)}function h(t,e){const{module_info:{type:o,location:l,identifier:n},sensor_list:s}=e;document.querySelector(`.${t}`)!==null?document.querySelector(`.${t}`):document.querySelector(".section-sensor-data").insertAdjacentHTML("beforeend",` <!-- NODE- ${t}-->
      <div class="sensor-data-node-box ${t}">
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
      </div>`);const r=document.querySelector(`.${t}`);r.querySelector(".sensor-data-info > h2").textContent=n,r.querySelector(".sensor-data-info > .location").textContent=o.toUpperCase(),r.querySelector(".sensor-data-info > .location").style.color="#ee5b5b",Object.entries(s).forEach(([d,v])=>{for(let c=1;c<=v;c++)r.querySelector(`.${d} > ul`).insertAdjacentHTML("beforeend",`<!-- SENSOR-${c}-->
          <li class="sensor-reading local-sensor-${c}">
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
      Sensor <span class="local-sensor-id">${c}</span>:
    </p>
    <div class="values">
      <p><span class="sensor-value temp">--</span> &deg;C</p> &xhArr;
      <p><span class="sensor-value hum">--</span> %</p>
    </div>
  </li>`)}),$(`.${t}`)}function b(){C(),T(),S()}function E(t){const{module_info:{type:e,location:o,identifier:l}}=t;document.querySelector(".type").textContent=e,document.querySelector(".module_id").textContent=l,document.querySelector(".title-location").textContent=o}function N(t,e){const o=document.querySelector(`.${t}-btn .rssi`);e>-50?o.style.backgroundColor="green":e<-50&&e>-70?o.style.backgroundColor="yellow":e<-70?o.style.backgroundColor="red":e<-100&&(o.style.backgroundColor="grey"),o.textContent=`${e}`}function T(){u.forEach(t=>{const e=a(t);!m.includes(t)&&document.querySelector(`.${e}`)!==null&&(document.querySelector(`.${e}`).remove(),document.querySelector(`.${e}-btn`).remove(),u.delete(t),console.log(`removed ${e}`))})}function A({uptime:t}){const e=[Math.floor(t/864e5),Math.floor(t%864e5/36e5),Math.floor(t%36e5/6e4),Math.floor(t%6e4/1e3)].map(o=>o.toString().padStart(2,"0"));document.querySelector(".uptime").textContent=`${e[0]} : ${e[1]} : ${e[2]} : ${e[3]}`}function O(t){const{module_info:e,sensor_data:o}=t,l=a(e.module_id),r=document.querySelector(`.${l}`).querySelector(`.${o.sensor_type}`).querySelector(`.local-sensor-${e.local_sensor_id}`);r.querySelector(".timestamp").textContent=o.timestamp,r.querySelector(".sensor-location").textContent=o.location,r.querySelector(".sensor-pin").textContent=o.module_pin,r.querySelector(".temp").textContent=`${o.sensor_data.temp.toFixed(2)}`,r.querySelector(".hum").textContent=`${o.sensor_data.humidity.toFixed(2)}`}function S(){document.querySelectorAll(".sensor-data-node-box").forEach(e=>{const o=e.querySelectorAll(".temp"),n=Array.from(o).reduce((s,r)=>s+Number(r.textContent),0)/o.length;e.querySelector(".sensor-avg").textContent=n.toFixed(2)})}function j(t){const{module_info:{type:e,identifier:o}}=t;let l=a(o);l=e+l.substring(l.indexOf("-")),console.log(l);const n=new WebSocket(`ws://littlelisa-${l}.local:8080/ws/sensor`);n.onopen=function(){console.log("sensor Data websocket connection established")},n.addEventListener("message",r=>{O(JSON.parse(r.data.replace(/\0+$/,"")))});const s=new WebSocket("ws://littlelisa-${nodeId}.local:8080/ws/log");s.onopen=function(){console.log("log data websocket connection established"),console.log("starting log in  5 seconds"),setTimeout(function(){s.send("start log")},5e3)},s.addEventListener("message",r=>{M(r.data)}),window.addEventListener("beforeunload",function(){s.send("stop log"),s.send(""),n.send("")})}function M(t){const o=document.querySelector(".log-output"),l=o.scrollHeight-o.clientHeight<=o.scrollTop+1;if(o.value+=(o.value?`
`:"")+D(t),o.value.length>1e5){let n=o.value.length-1e5,s=o.value.substring(n);o.value=`...[truncated]...
`+s}l&&(o.scrollTop=o.scrollHeight)}function D(t){let e=t.substring(t.indexOf("("));return e=e.substring(0,e.indexOf("[")-1),e}L.addEventListener("touchstart",t=>t.preventDefault());function a(t){return"node-"+t.replaceAll(":","_")}window.addEventListener("resize",()=>{console.log(`Viewport Width: ${window.innerWidth}, Viewport Height: ${window.innerHeight}`)});console.log(`Initial Viewport Width: ${window.innerWidth}, Initial Viewport Height: ${window.innerHeight}`);x();b();S();y();setInterval(b,15e3);setInterval(y,5e3);
