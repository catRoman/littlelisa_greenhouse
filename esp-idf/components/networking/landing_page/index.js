(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const c of n)if(c.type==="childList")for(const r of c.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function o(n){const c={};return n.integrity&&(c.integrity=n.integrity),n.referrerPolicy&&(c.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?c.credentials="include":n.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function s(n){if(n.ep)return;n.ep=!0;const c=o(n);fetch(n.href,c)}})();document.querySelector(".network-info");document.querySelector(".sensor-data-node-box");document.querySelector(".section-sensor-data");const M=document.querySelector(".log-output"),B=document.querySelector(".log-refresh"),R=document.querySelector(".sensor-refresh");let i,l;document.querySelector(".ota-log");const v=document.querySelector(".ota-status"),y=document.querySelector(".ota-status-info"),h=document.querySelector(".ota-status-reset"),U=document.getElementById("fileInput");let q=[];const x=new Set(null);let m="node",S;const $=document.getElementById("uploadBtn"),H=document.getElementById("uploadForm");H.addEventListener("submit",async e=>{e.preventDefault(),$.disabled=!0;const t=U.files[0],o="ota/update_prop";v.classList.toggle("hidden");try{const s=await fetch(o,{method:"POST",headers:{"Content-Type":"application/octet-stream"},body:t});if(s.ok){const n=await s.text();console.log(n),y.textContent="Upload Complete..."}else throw new Error(`Status: ${s.status}`)}catch(s){console.error("Error uploading file:",s),setTimeout(()=>{y.textContent="SD save failed...",h.textContent=s},1e4),v.classList.toggle("hidden"),$.disabled=!1}});B.addEventListener("touchend",e=>{i!==void 0&&(i.close(),console.log("refreshing log socket..."),M.value="Refreshing esp log stream...",setTimeout(()=>_(S),3e3))});R.addEventListener("touchend",e=>{l!==void 0&&(l.close(),setTimeout(()=>k(S),3e3))});const C=document.querySelector(".icon-open"),T=document.querySelector(".icon-close"),L=document.querySelector(".menu"),g=document.querySelector("main");document.querySelector(".nav-btn.close");const P=document.querySelectorAll(".nav-btn");P.forEach(e=>{e.addEventListener("touchend",function(t){t.stopPropagation;const o=[...this.classList];switch(o[o.length-1]){case"dev_btn":u(".device-info");break;case"net_btn":u(".network-info");break;case"db_btn":u(".sd-db-info");break;case"sys_btn":u(".system-health");break;case"ota_btn":S.module_info.type=="controller"?u(".ota-update"):console.log("Disabled for nodes. TODO: only render button for controller");break;case"close":C.classList.toggle("hidden"),g.classList.toggle("hidden"),L.classList.toggle("hidden"),g.style.pointerEvents="none",setTimeout(()=>{g.style.pointerEvents="auto"},100);break}})});C.addEventListener("touchend",()=>{C.classList.toggle("hidden"),g.classList.toggle("hidden"),L.classList.toggle("hidden")});function u(e){console.log(e),L.classList.toggle("hidden"),document.querySelector(e).classList.toggle("hidden"),T.classList.toggle("hidden")}T.addEventListener("touchend",()=>{const e=document.querySelector(".menu-select");Array.from(e.children).forEach(t=>{!t.classList.contains("hidden")&&!t.classList.contains("head-icon")&&(console.log(t.classList[0]),u(`.${t.classList[0]}`))})});function F(e){const t=document.querySelector(`${e} > .sensor-summary`);t.addEventListener("click",function(o){(o.target===this||this.contains(o.target))&&(t.nextElementSibling.classList.toggle("hidden"),t.querySelector(".node-title").classList.toggle("green"))})}async function V(){try{const e=await fetch("/api/deviceInfo.json");if(!e.ok)throw new Error("Network response wasnt very cool");const t=await e.json();ne(t)}catch(e){console.log(e)}}async function W(){try{const e=await fetch("/api/wifiApConnectInfo.json");if(!e.ok)throw new Error("Network response wasnt very cool");const t=await e.json();Q(t)}catch(e){console.log(e)}}async function z(){try{const e=await fetch("/api/wifiStaConnectInfo.json");if(!e.ok)throw new Error("Network response wasnt very cool");const t=await e.json();se(t)}catch(e){console.log(e)}}async function D(){try{const e=await fetch("/api/uptimeFunk.json");if(!e.ok)throw new Error("Network response was not ok");const t=await e.json();te(t)}catch(e){console.error("Error:",e)}}async function G(){try{const e=await fetch("/api/moduleInfo.json");if(!e.ok)throw new Error("Network response was not ok");const t=await e.json();m=t.module_info.type,console.log(m),S=t,Y(t),N(p(t.module_info.identifier),t),_(t),k(t),m==="controller"&&(I(),W())}catch(e){console.error("Error:",e)}}async function X(){try{const e=await fetch("/api/controllerStaList.json");if(!e.ok)throw new Error("Network response was not ok");const t=await e.json();q=Object.keys(t.sta_list),J(t)}catch{}}function J(e){const{sta_list:t}=e;Object.entries(t).forEach(([o,s])=>{const n=p(o);(async function(){try{const r=await fetch(`http://littlelisa-${n}.local/api/moduleInfo.json`);if(r.ok){const a=await r.json();document.querySelector(`.${n}`)===null&&(N(n,a),K(n,a,s),x.add(o)),Z(n,s)}else console.error(`${n} not a node`,error)}catch{}})()})}function K(e,t,o){const{module_info:{location:s,identifier:n}}=t;document.querySelector(".online-connections > .inside").insertAdjacentHTML("beforeend",`<a href="http://littlelisa-${e}.local"
        ><button class="online-connection-btn ${e}-btn">
          <h2 class="node-title">${n}</h2>
          <div class="loc-rssi">
            <p class="location">${s}</p>
            <p class="rssi"><span class="rssi-value">${o}</span><span class="dbm-label">dBm</span></p>

          </div>
        </button></a
        >`)}function N(e,t){const{module_info:{type:o,location:s,identifier:n},sensor_list:c}=t;document.querySelector(`.${e}`)!==null?document.querySelector(`.${e}`):document.querySelector(".section-sensor-data").insertAdjacentHTML("beforeend",` <!-- NODE- ${e}-->
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
      </div>`);const r=document.querySelector(`.${e}`);r.querySelector(".sensor-data-info > h2").textContent=n,r.querySelector(".sensor-data-info > .location").textContent=o.toUpperCase(),r.querySelector(".sensor-data-info > .location").style.color="#ee5b5b",Object.entries(c).forEach(([a,d])=>{for(let f=1;f<=d;f++)r.querySelector(`.${a} > ul`).insertAdjacentHTML("beforeend",`<!-- SENSOR-${f}-->
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
  </li>`)}),F(`.${e}`)}function Q(e){const{ap_ssid:t,ap_channel:o,ap_pass:s,ap_max_connect:n}=e;document.querySelector(".network-info > ul").insertAdjacentHTML("beforeend",`
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
            </li>       `),A()}function A(){const e=document.querySelector(".network-info  .connected-devices");let t="";q.forEach(o=>{t+=o+`
`}),e&&(e.value=t)}function I(){X(),A(),ee()}function Y(e){const{module_info:{type:t,location:o,identifier:s}}=e;document.querySelector(".type").textContent=t,document.querySelector(".module_id").textContent=s,document.querySelector(".title-location").textContent=o}function Z(e,t){const o=document.querySelector(`.${e}-btn .rssi`),s=document.querySelector(`.${e}-btn .rssi-value`);t>-50?o.style.backgroundColor="green":t<-50&&t>-70?o.style.backgroundColor="yellow":t<-70?o.style.backgroundColor="red":t<-100&&(o.style.backgroundColor="grey"),s.textContent=`${t}`}function ee(){x.forEach(e=>{const t=p(e);!q.includes(e)&&document.querySelector(`.${t}`)!==null&&(document.querySelector(`.${t}`).remove(),document.querySelector(`.${t}-btn`).remove(),x.delete(e),console.log(`removed ${t}`))})}function te({uptime:e}){const t=[Math.floor(e/864e5),Math.floor(e%864e5/36e5),Math.floor(e%36e5/6e4),Math.floor(e%6e4/1e3)].map(o=>o.toString().padStart(2,"0"));document.querySelector(".uptime").textContent=`${t[0]} : ${t[1]} : ${t[2]} : ${t[3]}`}function oe(e){const{module_info:t,sensor_data:o}=e,s=p(t.module_id),n=document.querySelector(`.${s}`),c=n==null?void 0:n.querySelector(`.${o.sensor_type}`),r=c==null?void 0:c.querySelector(`.local-sensor-${t.local_sensor_id}`);r!=null&&(r.querySelector(".timestamp").textContent=o.timestamp,r.querySelector(".sensor-location").textContent=o.location,r.querySelector(".sensor-pin").textContent=o.module_pin,r.querySelector(".temp").textContent=`${o.sensor_data.temp.toFixed(2)}`,r.querySelector(".hum").textContent=`${o.sensor_data.humidity.toFixed(2)}`)}function O(){document.querySelectorAll(".sensor-data-node-box").forEach(t=>{const o=t.querySelectorAll(".temp"),{sumTemp:s,count:n}=Array.from(o).reduce((r,a)=>{const d=Number(a.textContent);return Number.isNaN(d)||(r.sumTemp+=d,r.count++),r},{sumTemp:0,count:0}),c=n>0?s/n:0;t.querySelector(".sensor-avg").textContent=c.toFixed(2)})}function ne(e){const{chip_info:{num_cores:t,chip_type:o},app_info:{secure_ver:s,app_ver:n,proj_name:c,compile_info:{time:r,date:a,idf_ver:d}}}=e;document.querySelector(".device-info .proj-name").textContent=c,document.querySelector(".device-info .app-ver").textContent=n,document.querySelector(".device-info .sec-ver").textContent=s,document.querySelector(".device-info .cores").textContent=t,document.querySelector(".device-info .chip").textContent=o,document.querySelector(".device-info .time").textContent=r,document.querySelector(".device-info .date").textContent=a,document.querySelector(".device-info .idf-ver").textContent=d}function se(e){const{ip:t,netmask:o,gw:s,ap:n,rssi:c}=e;document.querySelector(".network-info .sta-ssid").textContent=n,document.querySelector(".network-info .rssi").textContent=c,document.querySelector(".network-info .ip").textContent=t,document.querySelector(".network-info .netmask").textContent=o,document.querySelector(".network-info .gateway").textContent=s}let b=0;function k(e){const{module_info:{type:t,identifier:o}}=e;let s=p(o);s=t+s.substring(s.indexOf("-")),l=new WebSocket(`ws://littlelisa-${s}.local:8080/ws/sensor`),l.onclose=n=>{if(!n.wasClean){let c=j(b);setTimeout(k,c),b++}},l.onopen=function(){console.log("sensor Data websocket connection established"),b=0},l.onmessage=n=>{oe(JSON.parse(n.data.replace(/\0+$/,"")))}}let w=0;function _(e,t){const{module_info:{type:o,identifier:s}}=e;let n=p(s);n=o+n.substring(n.indexOf("-")),i=new WebSocket(`ws://littlelisa-${n}.local:8080/ws/log`),i.onopen=function(){console.log("log data websocket connection established"),console.log("starting websocket log"),w=0,setTimeout(function(){i.send("start log")},1e3)},i.onclose=c=>{if(!c.wasClean){let r=j(w);setTimeout(_,r),w++}},i.onmessage=c=>{v.classList.contains("hidden")?E(c.data,"log-output"):(E(c.data,"ota-log"),re(c.data)),c.data.includes("ALL_NODE_UPDATES_COMPLETE")&&(console.log("Updating controller from SD..."),h.textContent="Updating Controller from SD..."),c.data.includes("REFRESH_DEBUG_PAGE")&&(console.log("OTA Update Complete. Refreshing page in 10 seconds..."),y.textContent="OTA Update Complete",h.textContent="OTA Update Complete. Refreshing page in 10 seconds...",setTimeout(()=>{window.location.reload()},1e4))},window.addEventListener("beforeunload",function(){i.send("stop log"),i.send(""),l.send("")})}function j(e){let s=Math.min(3e4,1e3*2**e);return console.log(`Reconnecting in ${s} ms`),s}function E(e,t){const s=document.querySelector(`.${t}`),n=s.scrollHeight-s.clientHeight<=s.scrollTop+1;if(s.value+=(s.value?`
`:"")+ce(e),s.value.length>1e5){let c=s.value.length-1e5,r=s.value.substring(c);s.value=`...[truncated]...
`+r}n&&(s.scrollTop=s.scrollHeight)}function ce(e){let t=e.substring(e.indexOf("("));return t=t.substring(0,t.indexOf("[")-1),t}function p(e){return"node-"+e.replaceAll(":","-")}function re(e){const t=/.*UPDATING_NODE_(\d+).*/,o=e.match(t);o&&(y.textContent="Updating",h.textContent=`Updating node ${o[1]}...`,console.log(`Updating node ${o[1]}...`))}window.addEventListener("resize",()=>{console.log(`Viewport Width: ${window.innerWidth}, Viewport Height: ${window.innerHeight}`)});console.log(`Initial Viewport Width: ${window.innerWidth}, Initial Viewport Height: ${window.innerHeight}`);G();z();V();O();D();setInterval(()=>{m==="controller"&&I()},5e3);setInterval(O,5e3);setInterval(D,5e3);
