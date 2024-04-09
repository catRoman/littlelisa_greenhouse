import "./css/general.css";
import "./css/index.css";

//menu-nav elements
const menuIcon = document.querySelector(".header-menu-icon");
const menu = document.querySelector(".menu");
const main = document.querySelector("main");
const navClose = document.querySelector(".nav-btn.close");
const menuBtns = document.querySelectorAll(".nav-btn");

//sensor-data elements
const nodeBox = document.querySelector(".sensor-data-node-box");

//=================
//  Nav
//===================

//nav menu button handler
menuBtns.forEach((el) => {
  el.addEventListener("touchstart", function (e) {
    const classes = [...this.classList];
    switch (classes[classes.length - 1]) {
      case "close":
        console.log("close");
        toggleNavMenu();
        break;

      default:
        console.log(this.textContent);
    }
  });
});

// menu toggle
menuIcon.addEventListener("touchstart", () => {
  toggleNavMenu();
  console.log(menuBtns);
});

function toggleNavMenu() {
  menuIcon.classList.toggle("invisible");
  main.classList.toggle("invisible");
  menu.classList.toggle("hidden");
  document.body.classList.toggle("overflow-hide");
  document.documentElement.classList.toggle("overflow-hide");
}

//===========================
//  Node sensor data display
//===========================

nodeBox.addEventListener("touchstart", (e) => {
  e.target
    .closest(".sensor-data-node-box")
    .lastElementChild.classList.toggle("hidden");
});
