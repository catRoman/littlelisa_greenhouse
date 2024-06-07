//
//=================
//  Nav
//===================

//nav menu button handler
//=============nav selectors================
const openButton = document.querySelector(".icon-open");
const closeButton = document.querySelector(".icon-close");
const menu = document.querySelector(".menu");
const main = document.querySelector("main");
const navClose = document.querySelector(".nav-btn.close");
const menuBtns = document.querySelectorAll(".nav-btn");
//========================================

function toggleInfoTab(navClass) {
  console.log(navClass);
  menu.classList.toggle("hidden");
  document.querySelector(navClass).classList.toggle("hidden");
  closeButton.classList.toggle("hidden");
}

function checkForNodeRemoval() {
  renderedNodeList.forEach((node) => {
    const validNodeClass = getValidNodeClass(node);

    if (
      !nodeListObj.includes(node) &&
      document.querySelector(`.${validNodeClass}`) !== null
    ) {
      document.querySelector(`.${validNodeClass}`).remove();
      document.querySelector(`.${validNodeClass}-btn`).remove();

      renderedNodeList.delete(node);

      console.log(`removed ${validNodeClass}`);
    }
  });
}

function updatePageTitle(moduleInfo) {
  const {
    module_info: { type, location, identifier },
  } = moduleInfo;

  //change title
  document.querySelector(".type").textContent = type;
  document.querySelector(".module_id").textContent = identifier;
  document.querySelector(".title-location").textContent = location;
  //change sensor-summary self
}

//==========================
//Render====================
//==========================

function renderConnectedDeviceLink(nodeId, moduleInfoObj, rssiValue) {
  const {
    module_info: { location, identifier },
  } = moduleInfoObj;

  const connectionBtns = document.querySelector(
    ".online-connections > .inside"
  );

  connectionBtns.insertAdjacentHTML(
    "beforeend",
    `<a href="http://littlelisa-${nodeId}.local"
    ><button class="online-connection-btn ${nodeId}-btn">
    <h2 class="node-title">${identifier}</h2>
    <div class="loc-rssi">
    <p class="location">${location}</p>
    <p class="rssi"><span class="rssi-value">${rssiValue}</span><span class="dbm-label">dBm</span></p>

    </div>
    </button></a
    >`
  );
}

//==========================
//Event Listeners===========
//==========================

closeButton.addEventListener("click", (e) => {
  closeEvent();
});
closeButton.addEventListener("touchend", (e) => {
  e.preventDefault();
  closeEvent();
});
openButton.addEventListener("click", (e) => {
  openEvent();
});
openButton.addEventListener("touchend", (e) => {
  e.preventDefault();
  openEvent();
});
menuBtns.forEach((el) => {
  el.addEventListener("click", function (e) {
    menuEvent(e, this.classList);
  });
});
menuBtns.forEach((el) => {
  el.addEventListener("touchend", function (e) {
    e.preventDefault();
    menuEvent(e, this.classList);
  });
});

//==========================
//Events====================
//==========================

function openEvent() {
  openButton.classList.toggle("hidden");
  main.classList.toggle("hidden");
  menu.classList.toggle("hidden");
}

function closeEvent() {
  const menuTabs = document.querySelector(".menu-select");
  Array.from(menuTabs.children).forEach((el) => {
    if (
      !el.classList.contains("hidden") &&
      !el.classList.contains("head-icon")
    ) {
      console.log(el.classList[0]);
      toggleInfoTab(`.${el.classList[0]}`);
    }
  });
}

function menuEvent(e, classList) {
  e.stopPropagation;
  const classes = [...classList];
  switch (classes[classes.length - 1]) {
    case "dev_btn":
      toggleInfoTab(".device-info");

      break;
    case "net_btn":
      toggleInfoTab(".network-info");
      break;
    case "db_btn":
      toggleInfoTab(".sd-db-info");
      break;
    case "sys_btn":
      toggleInfoTab(".system-health");
      break;
    case "ota_btn":
      if (moduleData.module_info.type == "controller") {
        toggleInfoTab(".ota-update");
      } else {
        console.log(
          "Disabled for nodes. TODO: only render button for controller"
        );
      }
      break;
    case "close":
      openButton.classList.toggle("hidden");
      main.classList.toggle("hidden");
      menu.classList.toggle("hidden");
      main.style.pointerEvents = "none";

      setTimeout(() => {
        main.style.pointerEvents = "auto";
      }, 100);
      break;
    default:
  }
}
