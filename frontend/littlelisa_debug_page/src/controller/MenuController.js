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
//+++++++++++++++openEvent
function openEvent() {
  openButton.classList.toggle("hidden");
  main.classList.toggle("hidden");
  menu.classList.toggle("hidden");
}
openButton.addEventListener("click", (e) => {
  openEvent();
});
openButton.addEventListener("touchend", (e) => {
  e.preventDefault();
  openEvent();
});
function toggleInfoTab(navClass) {
  console.log(navClass);
  menu.classList.toggle("hidden");
  document.querySelector(navClass).classList.toggle("hidden");
  closeButton.classList.toggle("hidden");
}

//+++++++++closeEvent
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
closeButton.addEventListener("click", (e) => {
  closeEvent();
});
closeButton.addEventListener("touchend", (e) => {
  e.preventDefault();
  closeEvent();
});

function toggleNavMenu() {}
