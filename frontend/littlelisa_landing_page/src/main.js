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

const endOfStickyContainer = startOfStickyContainer + window.innerHeight * 2;

console.log(window.innerHeight);
console.log(endOfStickyContainer);

document.querySelector(".scroll-spacer").style.height =
  window.innerHeight * 3 + "px";

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

    scrollContainer.style.position = "sticky";
    scrollContainer.style.top = "0px";
  } else if (window.scrollY > endOfStickyContainer) {
    scrollContainer.style.position = "absolute";
    scrollContainer.style.width = "100vw";
    scrollContainer.style.top = endOfStickyContainer + "px";
    // console.log("should stop");
  }
});

/**
 * form buttons and validation
 */

const formSubmitBtn = document.querySelector(".form-submit");

formSubmitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("submit button clicked");
});

/**
 * countdown clock for beta testing sign up
 */
const betaTestAppExpiry = new Date("Aug 7, 2024 23:20").getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const timeLeft = betaTestAppExpiry - now;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours =
    Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) +
    days * 24;

  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const paddedHours = String(hours).padStart(2, "0");
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");

  document.querySelector(
    ".countdown"
  ).innerHTML = `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;

  if (timeLeft < 0) {
    clearInterval(countdownInterval);
    document.querySelector(".countdown").innerHTML = "00:00:00:00";
  }
}

const countdownInterval = setInterval(updateCountdown, 1000);

updateCountdown();
