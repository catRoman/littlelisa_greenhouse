(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const l of n)if(l.type==="childList")for(const r of l.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function o(n){const l={};return n.integrity&&(l.integrity=n.integrity),n.referrerPolicy&&(l.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?l.credentials="include":n.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function s(n){if(n.ep)return;n.ep=!0;const l=o(n);fetch(n.href,l)}})();const v=document.querySelector(".header-menu-icon"),w=document.querySelector(".menu"),E=document.querySelector("main");document.querySelector(".nav-btn.close");const D=document.querySelectorAll(".nav-btn");document.querySelector(".network-info");document.querySelector(".sensor-data-node-box");document.querySelector(".section-sensor-data");const N=document.querySelector(".log-output"),O=document.querySelector(".log-refresh"),A=document.querySelector(".sensor-refresh");let i,c,q=[];const y=new Set(null);let f="node",h;D.forEach(t=>{t.addEventListener("touchend",function(e){e.stopPropagation;const o=[...this.classList];switch(o[o.length-1]){case"dev_btn":a(".device-info");break;case"net_btn":a(".network-info");break;case"db_btn":a(".sd-db-info");break;case"sys_btn":a(".system-health");break;case"ota_btn":a(".ota-update");break;case"close":x();break}})});O.addEventListener("touchend",t=>{i!==void 0&&(i.close(),console.log("refreshing log socket..."),N.value="Refreshing esp log stream...",setTimeout(()=>S(h),3e3))});A.addEventListener("touchend",t=>{c!==void 0&&(c.close(),setTimeout(()=>b(h),3e3))});v.addEventListener("touchend",()=>{x()});function x(){v.classList.toggle("invisible"),E.classList.toggle("invisible"),w.classList.toggle("hidden"),document.body.classList.toggle("overflow-hide"),document.documentElement.classList.toggle("overflow-hide"),document.querySelector("main").classList.toggle("body-disabled"),setTimeout(()=>document.querySelector("main").classList.toggle("body-disabled"),100)}function a(t){const e=document.querySelector(t);w.classList.toggle("hidden"),e.classList.toggle("hidden"),e.addEventListener("touchend",()=>a(t))}function M(t){const e=document.querySelector(`${t} > .sensor-summary`);e.addEventListener("click",function(o){(o.target===this||this.contains(o.target))&&(e.nextElementSibling.classList.toggle("hidden"),e.querySelector(".node-title").classList.toggle("green"))})}async function $(){try{const t=await fetch("/api/uptimeFunk.json");if(!t.ok)throw new Error("Network response was not ok");const e=await t.json();V(e)}catch(t){console.error("Error:",t)}}async function j(){try{const t=await fetch("/api/moduleInfo.json");if(!t.ok)throw new Error("Network response was not ok");const e=await t.json();f=e.module_info.type,console.log(f),h=e,I(e),L(d(e.module_info.identifier),e),S(e),b(e),f==="controller"&&C()}catch(t){console.error("Error:",t)}}async function H(){try{const t=await fetch("/api/controllerStaList.json");if(!t.ok)throw new Error("Network response was not ok");const e=await t.json();q=Object.keys(e.sta_list),R(e)}catch{}}function R(t){const{sta_list:e}=t;Object.entries(e).forEach(([o,s])=>{const n=d(o);(async function(){try{const r=await fetch(`http://littlelisa-${n}.local/api/moduleInfo.json`);if(r.ok){const p=await r.json();document.querySelector(`.${n}`)===null&&(L(n,p),B(n,p,s),y.add(o)),P(n,s)}else console.error(`${n} not a node`,error)}catch{}})()})}function B(t,e,o){const{module_info:{location:s,identifier:n}}=e;document.querySelector(".online-connections > .inside").insertAdjacentHTML("beforeend",`<a href="http://littlelisa-${t}.local"
        ><button class="online-connection-btn ${t}-btn">
          <h2 class="node-title">${n}</h2>
          <div class="loc-rssi">
            <p class="location">${s}</p>
            <p class="rssi">${o}</p>
          </div>
        </button></a
        >`)}function L(t,e){const{module_info:{type:o,location:s,identifier:n},sensor_list:l}=e;document.querySelector(`.${t}`)!==null?document.querySelector(`.${t}`):document.querySelector(".section-sensor-data").insertAdjacentHTML("beforeend",` <!-- NODE- ${t}-->
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
      </div>`);const r=document.querySelector(`.${t}`);r.querySelector(".sensor-data-info > h2").textContent=n,r.querySelector(".sensor-data-info > .location").textContent=o.toUpperCase(),r.querySelector(".sensor-data-info > .location").style.color="#ee5b5b",Object.entries(l).forEach(([p,T])=>{for(let u=1;u<=T;u++)r.querySelector(`.${p} > ul`).insertAdjacentHTML("beforeend",`<!-- SENSOR-${u}-->
          <li class="sensor-reading local-sensor-${u}">
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
      Sensor <span class="local-sensor-id">${u}</span>:
    </p>
    <div class="values">
      <p><span class="sensor-value temp">--</span> &deg;C</p> &xhArr;
      <p><span class="sensor-value hum">--</span> %</p>
    </div>
  </li>`)}),M(`.${t}`)}function C(){H(),F()}function I(t){const{module_info:{type:e,location:o,identifier:s}}=t;document.querySelector(".type").textContent=e,document.querySelector(".module_id").textContent=s,document.querySelector(".title-location").textContent=o}function P(t,e){const o=document.querySelector(`.${t}-btn .rssi`);e>-50?o.style.backgroundColor="green":e<-50&&e>-70?o.style.backgroundColor="yellow":e<-70?o.style.backgroundColor="red":e<-100&&(o.style.backgroundColor="grey"),o.textContent=`${e}`}function F(){y.forEach(t=>{const e=d(t);!q.includes(t)&&document.querySelector(`.${e}`)!==null&&(document.querySelector(`.${e}`).remove(),document.querySelector(`.${e}-btn`).remove(),y.delete(t),console.log(`removed ${e}`))})}function V({uptime:t}){const e=[Math.floor(t/864e5),Math.floor(t%864e5/36e5),Math.floor(t%36e5/6e4),Math.floor(t%6e4/1e3)].map(o=>o.toString().padStart(2,"0"));document.querySelector(".uptime").textContent=`${e[0]} : ${e[1]} : ${e[2]} : ${e[3]}`}function W(t){const{module_info:e,sensor_data:o}=t,s=d(e.module_id),r=document.querySelector(`.${s}`).querySelector(`.${o.sensor_type}`).querySelector(`.local-sensor-${e.local_sensor_id}`);r.querySelector(".timestamp").textContent=o.timestamp,r.querySelector(".sensor-location").textContent=o.location,r.querySelector(".sensor-pin").textContent=o.module_pin,r.querySelector(".temp").textContent=`${o.sensor_data.temp.toFixed(2)}`,r.querySelector(".hum").textContent=`${o.sensor_data.humidity.toFixed(2)}`}function k(){document.querySelectorAll(".sensor-data-node-box").forEach(e=>{const o=e.querySelectorAll(".temp"),n=Array.from(o).reduce((l,r)=>l+Number(r.textContent),0)/o.length;e.querySelector(".sensor-avg").textContent=n.toFixed(2)})}let m=0;function b(t){const{module_info:{type:e,identifier:o}}=t;let s=d(o);s=e+s.substring(s.indexOf("-")),c=new WebSocket(`ws://littlelisa-${s}.local:8080/ws/sensor`),c.onclose=n=>{if(!n.wasClean){let l=_(m);setTimeout(b,l),m++}},c.onopen=function(){console.log("sensor Data websocket connection established"),m=0},c.onmessage=n=>{W(JSON.parse(n.data.replace(/\0+$/,"")))}}let g=0;function S(t){const{module_info:{type:e,identifier:o}}=t;let s=d(o);s=e+s.substring(s.indexOf("-")),i=new WebSocket(`ws://littlelisa-${s}.local:8080/ws/log`),i.onopen=function(){console.log("log data websocket connection established"),console.log("starting websocket log"),g=0,setTimeout(function(){i.send("start log")},1e3)},i.onclose=n=>{if(!n.wasClean){let l=_(g);setTimeout(S,l),g++}},i.onmessage=n=>{U(n.data)},window.addEventListener("beforeunload",function(){i.send("stop log"),i.send(""),c.send("")})}function _(t){let s=Math.min(3e4,1e3*2**t);return console.log(`Reconnecting in ${s} ms`),s}function U(t){const o=document.querySelector(".log-output"),s=o.scrollHeight-o.clientHeight<=o.scrollTop+1;if(o.value+=(o.value?`
`:"")+z(t),o.value.length>1e5){let n=o.value.length-1e5,l=o.value.substring(n);o.value=`...[truncated]...
`+l}s&&(o.scrollTop=o.scrollHeight)}function z(t){let e=t.substring(t.indexOf("("));return e=e.substring(0,e.indexOf("[")-1),e}function d(t){return"node-"+t.replaceAll(":","_")}window.addEventListener("resize",()=>{console.log(`Viewport Width: ${window.innerWidth}, Viewport Height: ${window.innerHeight}`)});console.log(`Initial Viewport Width: ${window.innerWidth}, Initial Viewport Height: ${window.innerHeight}`);j();k();$();f==="controller"&&setInterval(C,15e3);setInterval(k,5e3);setInterval($,5e3);