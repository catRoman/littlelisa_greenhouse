//=============nav selectors================
const openButton = document.querySelector(".icon-open");
const closeButton = document.querySelector(".icon-close");
const menu = document.querySelector(".menu");
const main = document.querySelector("main");
const navClose = document.querySelector(".nav-btn.close");
const menuBtns = document.querySelectorAll(".nav-btn");

/**
 * Toggles the visibility of the information tab.
 * @param {string} navClass - The class selector for the navigation element.
 */
export function toggleInfoTab(navClass) {
  console.log(navClass);
  menu.classList.toggle("hidden");
  document.querySelector(navClass).classList.toggle("hidden");
  closeButton.classList.toggle("hidden");
}

/**
 * Checks for node removal and removes nodes that are not present in the nodeListObj.
 */
export function checkForNodeRemoval() {
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

/**
 * Updates the page title with the information from the module.
 * @param {Object} moduleInfo - The module information.
 * @param {Object} moduleInfo.module_info - The module information object.
 * @param {string} moduleInfo.module_info.type - The type of the module.
 * @param {string} moduleInfo.module_info.location - The location of the module.
 * @param {string} moduleInfo.module_info.identifier - The identifier of the module.
 */
export function updatePageTitle(moduleInfo) {
  const {
    module_info: { type, location, identifier },
  } = moduleInfo;

  //change title
  document.querySelector(".type").textContent = type;
  document.querySelector(".module_id").textContent = identifier;
  document.querySelector(".title-location").textContent = location;
  //change sensor-summary self
}

/**
 * Renders a connected device link with the provided information.
 *
 * @param {string} nodeId - The ID of the node.
 * @param {object} moduleInfoObj - The module information object.
 * @param {number} rssiValue - The RSSI value.
 */
export function renderConnectedDeviceLink(nodeId, moduleInfoObj, rssiValue) {
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

/**
 * Toggles the visibility of the openButton, main, and menu elements.
 */
export function openEvent() {
  openButton.classList.toggle("hidden");
  main.classList.toggle("hidden");
  menu.classList.toggle("hidden");
}

/**
 * Closes the menu tabs and toggles the info tab for each visible tab.
 */
export function closeEvent() {
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

/**
 * Handles the menu event based on the clicked button's class.
 * @param {Event} e - The event object.
 * @param {DOMTokenList} classList - The class list of the clicked button.
 */
export function menuEvent(e, classList) {
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
