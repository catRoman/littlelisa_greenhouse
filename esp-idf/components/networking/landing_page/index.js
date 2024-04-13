(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const c of r.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function o(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(n){if(n.ep)return;n.ep=!0;const r=o(n);fetch(n.href,r)}})();const q=document.querySelector(".header-menu-icon"),x=document.querySelector(".menu"),E=document.querySelector("main");document.querySelector(".nav-btn.close");const j=document.querySelectorAll(".nav-btn");document.querySelector(".network-info");document.querySelector(".sensor-data-node-box");document.querySelector(".section-sensor-data");const D=document.querySelector(".log-output"),M=document.querySelector(".log-refresh"),A=document.querySelector(".sensor-refresh");let i,a,S=[];const h=new Set(null);let m="node",b;j.forEach(e=>{e.addEventListener("touchend",function(t){t.stopPropagation;const o=[...this.classList];switch(o[o.length-1]){case"dev_btn":u(".device-info");break;case"net_btn":u(".network-info");break;case"db_btn":u(".sd-db-info");break;case"sys_btn":u(".system-health");break;case"ota_btn":u(".ota-update");break;case"close":C();break}})});M.addEventListener("touchend",e=>{i!==void 0&&(i.close(),console.log("refreshing log socket..."),D.value="Refreshing esp log stream...",setTimeout(()=>v(b),3e3))});A.addEventListener("touchend",e=>{a!==void 0&&(a.close(),setTimeout(()=>w(b),3e3))});q.addEventListener("touchend",()=>{C()});function C(){q.classList.toggle("invisible"),E.classList.toggle("invisible"),x.classList.toggle("hidden"),document.body.classList.toggle("overflow-hide"),document.documentElement.classList.toggle("overflow-hide"),document.querySelector("main").classList.toggle("body-disabled"),setTimeout(()=>document.querySelector("main").classList.toggle("body-disabled"),100)}function u(e){const t=document.querySelector(e);x.classList.toggle("hidden"),t.classList.toggle("hidden"),t.addEventListener("touchend",()=>u(e))}function I(e){const t=document.querySelector(`${e} > .sensor-summary`);t.addEventListener("click",function(o){(o.target===this||this.contains(o.target))&&(t.nextElementSibling.classList.toggle("hidden"),t.querySelector(".node-title").classList.toggle("green"))})}async function O(){try{const e=await fetch("/api/deviceInfo.json");if(!e.ok)throw new Error("Network response wasnt very cool");const t=await e.json();G(t)}catch(e){console.log(e)}}async function H(){try{const e=await fetch("/api/wifiApConnectInfo.json");if(!e.ok)throw new Error("Network response wasnt very cool");const t=await e.json();F(t)}catch(e){console.log(e)}}async function B(){try{const e=await fetch("/api/wifiStaConnectInfo.json");if(!e.ok)throw new Error("Network response wasnt very cool");const t=await e.json();Q(t)}catch(e){console.log(e)}}async function k(){try{const e=await fetch("/api/uptimeFunk.json");if(!e.ok)throw new Error("Network response was not ok");const t=await e.json();J(t)}catch(e){console.error("Error:",e)}}async function R(){try{const e=await fetch("/api/moduleInfo.json");if(!e.ok)throw new Error("Network response was not ok");const t=await e.json();m=t.module_info.type,console.log(m),b=t,U(t),$(p(t.module_info.identifier),t),v(t),w(t),m==="controller"&&(_(),H())}catch(e){console.error("Error:",e)}}async function P(){try{const e=await fetch("/api/controllerStaList.json");if(!e.ok)throw new Error("Network response was not ok");const t=await e.json();S=Object.keys(t.sta_list),V(t)}catch{}}function V(e){const{sta_list:t}=e;Object.entries(t).forEach(([o,s])=>{const n=p(o);(async function(){try{const c=await fetch(`http://littlelisa-${n}.local/api/moduleInfo.json`);if(c.ok){const l=await c.json();document.querySelector(`.${n}`)===null&&($(n,l),W(n,l,s),h.add(o)),z(n,s)}else console.error(`${n} not a node`,error)}catch{}})()})}function W(e,t,o){const{module_info:{location:s,identifier:n}}=t;document.querySelector(".online-connections > .inside").insertAdjacentHTML("beforeend",`<a href="http://littlelisa-${e}.local"
        ><button class="online-connection-btn ${e}-btn">
          <h2 class="node-title">${n}</h2>
          <div class="loc-rssi">
            <p class="location">${s}</p>
            <p class="rssi"><span class="rssi-value">${o}</span><span class="dbm-label">dBm</span></p>

          </div>
        </button></a
        >`)}function $(e,t){const{module_info:{type:o,location:s,identifier:n},sensor_list:r}=t;document.querySelector(`.${e}`)!==null?document.querySelector(`.${e}`):document.querySelector(".section-sensor-data").insertAdjacentHTML("beforeend",` <!-- NODE- ${e}-->
      <div class="sensor-data-node-box ${e}">
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
      </div>`);const c=document.querySelector(`.${e}`);c.querySelector(".sensor-data-info > h2").textContent=n,c.querySelector(".sensor-data-info > .location").textContent=o.toUpperCase(),c.querySelector(".sensor-data-info > .location").style.color="#ee5b5b",Object.entries(r).forEach(([l,d])=>{for(let f=1;f<=d;f++)c.querySelector(`.${l} > ul`).insertAdjacentHTML("beforeend",`<!-- SENSOR-${f}-->
          <li class="sensor-reading local-sensor-${f}">
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
      Sensor <span class="local-sensor-id">${f}</span>:
    </p>
    <div class="values">
      <p><span class="sensor-value temp">--</span> &deg;C</p> &xhArr;
      <p><span class="sensor-value hum">--</span> %</p>
    </div>
  </li>`)}),I(`.${e}`)}function F(e){const{ap_ssid:t,ap_channel:o,ap_pass:s,ap_max_connect:n}=e;document.querySelector(".network-info > ul").insertAdjacentHTML("beforeend",`
  <li class="ap-info">
              <h3 class="subheading">Access Point Info</h3>
              <ul>
                <li>SSID:<span class="ap-ssid">${t}</span></li>
                <li>Channel:<span class="channel">${o}</span></li>
                <li>Password:<span class="password">${s}</span></li>
                <li>Max Connections:<span class="max-connections">${n}</span></li>
              </ul>
            </li>
            <li class="connected-sta">
              <h3 class="subheading">Connected Stations</h3>
              <textarea class="connected-devices"></textarea>
            </li>       `),L()}function L(){const e=document.querySelector(".network-info  .connected-devices");S.forEach(t=>{e.value+=t+`
`})}function _(){P(),L(),X()}function U(e){const{module_info:{type:t,location:o,identifier:s}}=e;document.querySelector(".type").textContent=t,document.querySelector(".module_id").textContent=s,document.querySelector(".title-location").textContent=o}function z(e,t){const o=document.querySelector(`.${e}-btn .rssi`),s=document.querySelector(`.${e}-btn .rssi-value`);t>-50?o.style.backgroundColor="green":t<-50&&t>-70?o.style.backgroundColor="yellow":t<-70?o.style.backgroundColor="red":t<-100&&(o.style.backgroundColor="grey"),s.textContent=`${t}`}function X(){h.forEach(e=>{const t=p(e);!S.includes(e)&&document.querySelector(`.${t}`)!==null&&(document.querySelector(`.${t}`).remove(),document.querySelector(`.${t}-btn`).remove(),h.delete(e),console.log(`removed ${t}`))})}function J({uptime:e}){const t=[Math.floor(e/864e5),Math.floor(e%864e5/36e5),Math.floor(e%36e5/6e4),Math.floor(e%6e4/1e3)].map(o=>o.toString().padStart(2,"0"));document.querySelector(".uptime").textContent=`${t[0]} : ${t[1]} : ${t[2]} : ${t[3]}`}function K(e){const{module_info:t,sensor_data:o}=e,s=p(t.module_id),c=document.querySelector(`.${s}`).querySelector(`.${o.sensor_type}`).querySelector(`.local-sensor-${t.local_sensor_id}`);c.querySelector(".timestamp").textContent=o.timestamp,c.querySelector(".sensor-location").textContent=o.location,c.querySelector(".sensor-pin").textContent=o.module_pin,c.querySelector(".temp").textContent=`${o.sensor_data.temp.toFixed(2)}`,c.querySelector(".hum").textContent=`${o.sensor_data.humidity.toFixed(2)}`}function T(){document.querySelectorAll(".sensor-data-node-box").forEach(t=>{const o=t.querySelectorAll(".temp"),{sumTemp:s,count:n}=Array.from(o).reduce((c,l)=>{const d=Number(l.textContent);return Number.isNaN(d)||(c.sumTemp+=d,c.count++),c},{sumTemp:0,count:0}),r=n>0?s/n:0;t.querySelector(".sensor-avg").textContent=r.toFixed(2)})}function G(e){const{chip_info:{num_cores:t,chip_type:o},app_info:{secure_ver:s,app_ver:n,proj_name:r,compile_info:{time:c,date:l,idf_ver:d}}}=e;document.querySelector(".device-info .proj-name").textContent=r,document.querySelector(".device-info .app-ver").textContent=n,document.querySelector(".device-info .sec-ver").textContent=s,document.querySelector(".device-info .cores").textContent=t,document.querySelector(".device-info .chip").textContent=o,document.querySelector(".device-info .time").textContent=c,document.querySelector(".device-info .date").textContent=l,document.querySelector(".device-info .idf-ver").textContent=d}function Q(e){const{ip:t,netmask:o,gw:s,ap:n,rssi:r}=e;document.querySelector(".network-info .sta-ssid").textContent=n,document.querySelector(".network-info .rssi").textContent=r,document.querySelector(".network-info .ip").textContent=t,document.querySelector(".network-info .netmask").textContent=o,document.querySelector(".network-info .gateway").textContent=s}let y=0;function w(e){const{module_info:{type:t,identifier:o}}=e;let s=p(o);s=t+s.substring(s.indexOf("-")),a=new WebSocket(`ws://littlelisa-${s}.local:8080/ws/sensor`),a.onclose=n=>{if(!n.wasClean){let r=N(y);setTimeout(w,r),y++}},a.onopen=function(){console.log("sensor Data websocket connection established"),y=0},a.onmessage=n=>{K(JSON.parse(n.data.replace(/\0+$/,"")))}}let g=0;function v(e){const{module_info:{type:t,identifier:o}}=e;let s=p(o);s=t+s.substring(s.indexOf("-")),i=new WebSocket(`ws://littlelisa-${s}.local:8080/ws/log`),i.onopen=function(){console.log("log data websocket connection established"),console.log("starting websocket log"),g=0,setTimeout(function(){i.send("start log")},1e3)},i.onclose=n=>{if(!n.wasClean){let r=N(g);setTimeout(v,r),g++}},i.onmessage=n=>{Y(n.data)},window.addEventListener("beforeunload",function(){i.send("stop log"),i.send(""),a.send("")})}function N(e){let s=Math.min(3e4,1e3*2**e);return console.log(`Reconnecting in ${s} ms`),s}function Y(e){const o=document.querySelector(".log-output"),s=o.scrollHeight-o.clientHeight<=o.scrollTop+1;if(o.value+=(o.value?`
`:"")+Z(e),o.value.length>1e5){let n=o.value.length-1e5,r=o.value.substring(n);o.value=`...[truncated]...
`+r}s&&(o.scrollTop=o.scrollHeight)}function Z(e){let t=e.substring(e.indexOf("("));return t=t.substring(0,t.indexOf("[")-1),t}function p(e){return"node-"+e.replaceAll(":","_")}window.addEventListener("resize",()=>{console.log(`Viewport Width: ${window.innerWidth}, Viewport Height: ${window.innerHeight}`)});console.log(`Initial Viewport Width: ${window.innerWidth}, Initial Viewport Height: ${window.innerHeight}`);R();B();O();T();k();setInterval(()=>{m==="controller"&&_()},15e3);setInterval(T,5e3);setInterval(k,5e3);
