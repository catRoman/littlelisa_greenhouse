(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const c of r.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&n(c)}).observe(document,{childList:!0,subtree:!0});function o(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=o(s);fetch(s.href,r)}})();document.querySelector(".network-info");document.querySelector(".sensor-data-node-box");document.querySelector(".section-sensor-data");const z=document.querySelector(".log-output"),A=document.querySelector(".log-refresh"),N=document.querySelector(".sensor-refresh");let a,l;document.querySelector(".ota-log");const x=document.querySelector(".ota-status"),h=document.querySelector(".ota-status-info"),y=document.querySelector(".ota-status-reset"),G=document.getElementById("fileInput");let q=[],I={};const C=new Set(null);let m="node",S;const T=document.getElementById("uploadBtn"),X=document.getElementById("uploadForm");X.addEventListener("submit",async e=>{e.preventDefault(),T.disabled=!0;const t=G.files[0],o="ota/update_prop";x.classList.toggle("hidden");try{const n=await fetch(o,{method:"POST",headers:{"Content-Type":"application/octet-stream"},body:t});if(n.ok){const s=await n.text();console.log(s),h.textContent="Upload Complete..."}else throw new Error(`Status: ${n.status}`)}catch(n){console.error("Error uploading file:",n),setTimeout(()=>{h.textContent="SD save failed...",y.textContent=n},1e4),x.classList.toggle("hidden"),T.disabled=!1}});function j(){a!==void 0&&(a.close(),console.log("refreshing log socket..."),z.value="Refreshing esp log stream...",setTimeout(()=>_(S),3e3))}A.addEventListener("click",e=>{j()});A.addEventListener("touchend",e=>{e.preventDefault(),j()});function J(){l!==void 0&&(l.close(),setTimeout(()=>$(S),3e3))}N.addEventListener("click",e=>{J()});N.addEventListener("touchend",e=>{e.preventDefault(),sensorRefreshEv,ent()});const v=document.querySelector(".icon-open"),E=document.querySelector(".icon-close"),k=document.querySelector(".menu"),g=document.querySelector("main");document.querySelector(".nav-btn.close");const O=document.querySelectorAll(".nav-btn");function M(e,t){e.stopPropagation;const o=[...t];switch(o[o.length-1]){case"dev_btn":u(".device-info");break;case"net_btn":u(".network-info");break;case"db_btn":u(".sd-db-info");break;case"sys_btn":u(".system-health");break;case"ota_btn":S.module_info.type=="controller"?u(".ota-update"):console.log("Disabled for nodes. TODO: only render button for controller");break;case"close":v.classList.toggle("hidden"),g.classList.toggle("hidden"),k.classList.toggle("hidden"),g.style.pointerEvents="none",setTimeout(()=>{g.style.pointerEvents="auto"},100);break}}O.forEach(e=>{e.addEventListener("click",function(t){M(t,this.classList)})});O.forEach(e=>{e.addEventListener("touchend",function(t){t.preventDefault(),M(t,this.classList)})});function B(){v.classList.toggle("hidden"),g.classList.toggle("hidden"),k.classList.toggle("hidden")}v.addEventListener("click",e=>{B()});v.addEventListener("touchend",e=>{e.preventDefault(),B()});function u(e){console.log(e),k.classList.toggle("hidden"),document.querySelector(e).classList.toggle("hidden"),E.classList.toggle("hidden")}function R(){const e=document.querySelector(".menu-select");Array.from(e.children).forEach(t=>{!t.classList.contains("hidden")&&!t.classList.contains("head-icon")&&(console.log(t.classList[0]),u(`.${t.classList[0]}`))})}E.addEventListener("click",e=>{R()});E.addEventListener("touchend",e=>{e.preventDefault(),R()});function K(e){const t=document.querySelector(`${e} > .sensor-summary`);t.addEventListener("click",function(o){(o.target===this||this.contains(o.target))&&(t.nextElementSibling.classList.toggle("hidden"),t.querySelector(".node-title").classList.toggle("green"))})}async function L(){try{const e=await fetch("/api/envState");if(!e.ok)throw new Error("Network response was not ok");const t=await e.json();I=Object.values(t),Y()}catch(e){console.log(e.message)}}async function Q(e){try{const t=await fetch("/api/envStateUpdate",{method:"PUT",body:e});if(!t.ok)throw new Error("Network response was not ok");const o=await t.json();L()}catch(t){console.log(t.message)}}function Y(){const e=document.querySelector(".env-cntrl");e.innerHTML="",I.forEach(o=>{e.insertAdjacentHTML("beforeend",` <li class="env-li" >
      <p>Id:${o.id} &harr; P:${o.pin} &harr; ${o.type} &rarr;</p>
      <button data-id="${o.id}" class="env-status ${o.state==="on"?"env-status-on":"env-status-off"}">${o.state}</button>
      </li>`)}),e.querySelectorAll(".env-status").forEach(o=>{o.addEventListener("click",function(n){const s=this.getAttribute("data-id");n.preventDefault(),n.stopPropagation(),Q(s)})})}L();async function Z(){try{const e=await fetch("/api/deviceInfo.json");if(!e.ok)throw new Error("Network response wasnt very cool");const t=await e.json();fe(t)}catch(e){console.log(e)}}async function ee(){try{const e=await fetch("/api/wifiApConnectInfo.json");if(!e.ok)throw new Error("Network response wasnt very cool");const t=await e.json();ce(t)}catch(e){console.log(e)}}async function te(){try{const e=await fetch("/api/wifiStaConnectInfo.json");if(!e.ok)throw new Error("Network response wasnt very cool");const t=await e.json();pe(t)}catch(e){console.log(e)}}async function U(){try{const e=await fetch("/api/uptimeFunk.json");if(!e.ok)throw new Error("Network response was not ok");const t=await e.json();de(t)}catch(e){console.error("Error:",e)}}async function oe(){try{const e=await fetch("/api/moduleInfo.json");if(!e.ok)throw new Error("Network response was not ok");const t=await e.json();m=t.module_info.type,console.log(m),S=t,ae(t),H(f(t.module_info.identifier),t),_(t),$(t),m==="controller"&&(F(),ee())}catch(e){console.error("Error:",e)}}async function ne(){try{const e=await fetch("/api/controllerStaList.json");if(!e.ok)throw new Error("Network response was not ok");const t=await e.json();q=Object.keys(t.sta_list),se(t)}catch{}}function se(e){const{sta_list:t}=e;Object.entries(t).forEach(([o,n])=>{const s=f(o);(async function(){try{const c=await fetch(`http://littlelisa-${s}.local/api/moduleInfo.json`);if(c.ok){const i=await c.json();document.querySelector(`.${s}`)===null&&(H(s,i),re(s,i,n),C.add(o)),ie(s,n)}else console.error(`${s} not a node`,error)}catch{}})()})}function re(e,t,o){const{module_info:{location:n,identifier:s}}=t;document.querySelector(".online-connections > .inside").insertAdjacentHTML("beforeend",`<a href="http://littlelisa-${e}.local"
        ><button class="online-connection-btn ${e}-btn">
          <h2 class="node-title">${s}</h2>
          <div class="loc-rssi">
            <p class="location">${n}</p>
            <p class="rssi"><span class="rssi-value">${o}</span><span class="dbm-label">dBm</span></p>

          </div>
        </button></a
        >`)}function H(e,t){const{module_info:{type:o,location:n,identifier:s},sensor_list:r}=t;document.querySelector(`.${e}`)!==null?document.querySelector(`.${e}`):document.querySelector(".section-sensor-data").insertAdjacentHTML("beforeend",` <!-- NODE- ${e}-->
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
      </div>`);const c=document.querySelector(`.${e}`);c.querySelector(".sensor-data-info > h2").textContent=s,c.querySelector(".sensor-data-info > .location").textContent=o.toUpperCase(),c.querySelector(".sensor-data-info > .location").style.color="#ee5b5b",Object.entries(r).forEach(([i,d])=>{for(let p=1;p<=d;p++)c.querySelector(`.${i} > ul`).insertAdjacentHTML("beforeend",`<!-- SENSOR-${p}-->
          <li class="sensor-reading local-sensor-${p}">
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
      Sensor <span class="local-sensor-id">${p}</span>:
    </p>
    <div class="values">
      <p><span class="sensor-value temp">--</span> &deg;C</p> &xhArr;
      <p><span class="sensor-value hum">--</span> %</p>
    </div>
  </li>`)}),K(`.${e}`)}function ce(e){const{ap_ssid:t,ap_channel:o,ap_pass:n,ap_max_connect:s}=e;document.querySelector(".network-info > ul").insertAdjacentHTML("beforeend",`
  <li class="ap-info">
              <h3 class="subheading">Access Point Info</h3>
              <ul>
                <li>SSID:<span class="ap-ssid">${t}</span></li>
                <li>Channel:<span class="channel">${o}</span></li>
                <li>Password:<span class="password">${n}</span></li>
                <li>Max Connections:<span class="max-connections">${s}</span></li>
              </ul>
            </li>
            <li class="connected-sta">
              <h3 class="subheading">Connected Stations</h3>
              <textarea class="connected-devices"></textarea>
            </li>       `),P()}function P(){const e=document.querySelector(".network-info  .connected-devices");let t="";q.forEach(o=>{t+=o+`
`}),e&&(e.value=t)}function F(){ne(),P(),le()}function ae(e){const{module_info:{type:t,location:o,identifier:n}}=e;document.querySelector(".type").textContent=t,document.querySelector(".module_id").textContent=n,document.querySelector(".title-location").textContent=o}function ie(e,t){const o=document.querySelector(`.${e}-btn .rssi`),n=document.querySelector(`.${e}-btn .rssi-value`);t>-50?o.style.backgroundColor="green":t<-50&&t>-70?o.style.backgroundColor="yellow":t<-70?o.style.backgroundColor="red":t<-100&&(o.style.backgroundColor="grey"),n.textContent=`${t}`}function le(){C.forEach(e=>{const t=f(e);!q.includes(e)&&document.querySelector(`.${t}`)!==null&&(document.querySelector(`.${t}`).remove(),document.querySelector(`.${t}-btn`).remove(),C.delete(e),console.log(`removed ${t}`))})}function de({uptime:e}){const t=[Math.floor(e/864e5),Math.floor(e%864e5/36e5),Math.floor(e%36e5/6e4),Math.floor(e%6e4/1e3)].map(o=>o.toString().padStart(2,"0"));document.querySelector(".uptime").textContent=`${t[0]} : ${t[1]} : ${t[2]} : ${t[3]}`}function ue(e){const{module_info:t,sensor_info:o}=e,n=f(t.identifier),s=document.querySelector(`.${n}`),r=s==null?void 0:s.querySelector(`.${o.sensor_type}`),c=r==null?void 0:r.querySelector(`.local-sensor-${o.local_sensor_id}`);c!=null&&(c.querySelector(".timestamp").textContent=o.timestamp,c.querySelector(".sensor-location").textContent=o.location,c.querySelector(".sensor-pin").textContent=o.sensor_pin,c.querySelector(".temp").textContent=`${o.data.temperature.toFixed(2)}`,c.querySelector(".hum").textContent=`${o.data.humidity.toFixed(2)}`)}function V(){document.querySelectorAll(".sensor-data-node-box").forEach(t=>{const o=t.querySelectorAll(".temp"),{sumTemp:n,count:s}=Array.from(o).reduce((c,i)=>{const d=Number(i.textContent);return Number.isNaN(d)||(c.sumTemp+=d,c.count++),c},{sumTemp:0,count:0}),r=s>0?n/s:0;t.querySelector(".sensor-avg").textContent=r.toFixed(2)})}function fe(e){const{chip_info:{num_cores:t,chip_type:o},app_info:{secure_ver:n,app_ver:s,proj_name:r,compile_info:{time:c,date:i,idf_ver:d}}}=e;document.querySelector(".device-info .proj-name").textContent=r,document.querySelector(".device-info .app-ver").textContent=s,document.querySelector(".device-info .sec-ver").textContent=n,document.querySelector(".device-info .cores").textContent=t,document.querySelector(".device-info .chip").textContent=o,document.querySelector(".device-info .time").textContent=c,document.querySelector(".device-info .date").textContent=i,document.querySelector(".device-info .idf-ver").textContent=d}function pe(e){const{ip:t,netmask:o,gw:n,ap:s,rssi:r}=e;document.querySelector(".network-info .sta-ssid").textContent=s,document.querySelector(".network-info .rssi").textContent=r,document.querySelector(".network-info .ip").textContent=t,document.querySelector(".network-info .netmask").textContent=o,document.querySelector(".network-info .gateway").textContent=n}let w=0;function $(e){const{module_info:{type:t,identifier:o}}=e;let n=f(o);n=t+n.substring(n.indexOf("-")),l=new WebSocket(`ws://littlelisa-${n}.local:8080/ws/sensor`),l.onclose=s=>{if(!s.wasClean){let r=W(w);setTimeout($,r),w++}},l.onopen=function(){console.log("sensor Data websocket connection established"),w=0},l.onmessage=s=>{ue(JSON.parse(s.data.replace(/\0+$/,"")))}}let b=0;function _(e,t){const{module_info:{type:o,identifier:n}}=e;let s=f(n);s=o+s.substring(s.indexOf("-")),a=new WebSocket(`ws://littlelisa-${s}.local:8080/ws/log`),a.onopen=function(){console.log("log data websocket connection established"),console.log("starting websocket log"),b=0,setTimeout(function(){a.send("start log")},1e3)},a.onclose=r=>{if(!r.wasClean){let c=W(b);setTimeout(_,c),b++}},a.onmessage=r=>{x.classList.contains("hidden")?D(r.data,"log-output"):(D(r.data,"ota-log"),ge(r.data)),r.data.includes("ALL_NODE_UPDATES_COMPLETE")&&(console.log("Updating controller from SD..."),y.textContent="Updating Controller from SD..."),r.data.includes("REFRESH_DEBUG_PAGE")&&(console.log("OTA Update Complete. Refreshing page in 10 seconds..."),h.textContent="OTA Update Complete",y.textContent=`OTA Update Complete. Wifi Restarting - please ensure your reconnection.
Refreshing page in 10 seconds...`,setTimeout(()=>{window.location.reload()},1e4))},window.addEventListener("beforeunload",function(){a.send("stop log"),a.send(""),l.send("")})}function W(e){let n=Math.min(3e4,1e3*2**e);return console.log(`Reconnecting in ${n} ms`),n}function D(e,t){const n=document.querySelector(`.${t}`),s=n.scrollHeight-n.clientHeight<=n.scrollTop+1;if(n.value+=(n.value?`
`:"")+me(e),n.value.length>1e5){let r=n.value.length-1e5,c=n.value.substring(r);n.value=`...[truncated]...
`+c}s&&(n.scrollTop=n.scrollHeight)}function me(e){let t=e.substring(e.indexOf("("));return t=t.substring(0,t.indexOf("[")-1),t}function f(e){return"node-"+e.replaceAll(":","-")}function ge(e){const t=/.*UPDATING_NODE_(\d+).*/,o=e.match(t);o&&(h.textContent="Updating",y.textContent=`Updating node ${o[1]}...`,console.log(`Updating node ${o[1]}...`))}window.addEventListener("resize",()=>{console.log(`Viewport Width: ${window.innerWidth}, Viewport Height: ${window.innerHeight}`)});console.log(`Initial Viewport Width: ${window.innerWidth}, Initial Viewport Height: ${window.innerHeight}`);oe();te();Z();V();U();setInterval(()=>{m==="controller"&&F()},5e3);setInterval(V,5e3);setInterval(U,5e3);setInterval(L,3e4);
