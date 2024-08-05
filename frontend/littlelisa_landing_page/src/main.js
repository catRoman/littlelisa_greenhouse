import "./css/index.css";
import javascriptLogo from "./javascript.svg";

/**
 * sticky scroll fade in/out
 */

const scrollContainer = document.querySelector(".scroll-container");
const sensorScene = document.querySelector(".sensor");
const enviroScene = document.querySelector(".enviromental-control");
const historyScene = document.querySelector(".history");
const debugScene = document.querySelector(".debug");

const startOfStickyContainer = document
  .querySelector(".scroll-container")
  .getBoundingClientRect().top;

const endOfStickyContainer = startOfStickyContainer + window.innerHeight * 4;

console.log(window.innerHeight);
console.log(endOfStickyContainer);

document.querySelector(".scroll-spacer").style.height =
  window.innerHeight * 5 + "px";

window.addEventListener("scroll", () => {
  if (
    window.scrollY > startOfStickyContainer &&
    window.scrollY <= endOfStickyContainer
  ) {
    console.log(window.scrollY);

    if (
      window.scrollY > startOfStickyContainer &&
      window.scrollY <= startOfStickyContainer + window.innerHeight
    ) {
      if (window.scrollY > startOfStickyContainer + window.innerHeight * 0.66) {
        console.log("fade out scene 1");
        //linear interpolation for transitions
        // const fadeStart = startOfStickyContainer + window.innerHeight * 0.66;
        // const fadeEnd = startOfStickyContainer + window.innerHeight;

        // // Calculate normalized scroll position within the fade range
        // const normalizedScroll =
        //   (window.scrollY - fadeStart) / (fadeEnd - fadeStart);

        // // Calculate opacity based on normalized scroll position
        // const opacity = Math.max(1 - normalizedScroll, 0); // Ensures opacity does not go below 0

        // // Apply calculated opacity
        // sensorScene.style.opacity = opacity;
      } else {
        console.log("scene 1");
        sensorScene.style.opacity = 1;
        enviroScene.style.opacity = 0;
        historyScene.style.opacity = 0;
        debugScene.style.opacity = 0;
      }
    }
    // Scene 2
    else if (
      window.scrollY > startOfStickyContainer + window.innerHeight &&
      window.scrollY <= startOfStickyContainer + window.innerHeight * 2
    ) {
      if (window.scrollY < startOfStickyContainer + window.innerHeight * 1.33) {
        console.log("fade in scene 2");
      } else if (scrollY > startOfStickyContainer + window.innerHeight * 1.66) {
        console.log("fade out scene 2");
      } else {
        console.log("scene 2");
        sensorScene.style.opacity = 0;
        enviroScene.style.opacity = 1;
        historyScene.style.opacity = 0;
        debugScene.style.opacity = 0;
      }
    }
    // Scene 3
    else if (
      window.scrollY > startOfStickyContainer + window.innerHeight * 2 &&
      window.scrollY <= startOfStickyContainer + window.innerHeight * 3
    ) {
      if (window.scrollY < startOfStickyContainer + window.innerHeight * 2.33) {
        console.log("fade in scene 3");
      } else if (scrollY > startOfStickyContainer + window.innerHeight * 2.66) {
        console.log("fade out scene 3");
      } else {
        console.log("scene 3");
        sensorScene.style.opacity = 0;
        enviroScene.style.opacity = 0;
        historyScene.style.opacity = 1;
        debugScene.style.opacity = 0;
      }
    }
    // Scene 3
    else if (
      window.scrollY > startOfStickyContainer + window.innerHeight * 3 &&
      window.scrollY <= startOfStickyContainer + window.innerHeight * 4
    ) {
      if (window.scrollY < startOfStickyContainer + window.innerHeight * 3.33) {
        console.log("fade in scene 4");
      } else if (scrollY > startOfStickyContainer + window.innerHeight * 3.66) {
        console.log("fade out scene 4");
      } else {
        console.log("scene 4");
        sensorScene.style.opacity = 0;
        enviroScene.style.opacity = 0;
        historyScene.style.opacity = 0;
        debugScene.style.opacity = 1;
      }
    }
    scrollContainer.style.position = "sticky";
    scrollContainer.style.top = "0px";
  } else if (window.scrollY > endOfStickyContainer) {
    scrollContainer.style.position = "absolute";
    scrollContainer.style.width = "100vw";
    scrollContainer.style.top = endOfStickyContainer + "px";
    console.log("should stop");
  }
});
