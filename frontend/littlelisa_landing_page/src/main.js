import "./css/index.css";
import javascriptLogo from "./javascript.svg";

/**
 * sticky scroll fade in/out
 */

const scrollContainer = document.querySelector(".scroll-container");

const startOfStickyContainer = document
  .querySelector(".scroll-container")
  .getBoundingClientRect().top;

const endOfStickyContainer = startOfStickyContainer + window.innerHeight * 3;

console.log(window.innerHeight);
console.log(endOfStickyContainer);

document.querySelector(".scroll-spacer").style.height =
  window.innerHeight * 4 + "px";

window.addEventListener("scroll", () => {
  if (
    window.scrollY > startOfStickyContainer &&
    window.scrollY <= endOfStickyContainer
  ) {
    console.log(window.scrollY);

    if (
      //scene 1
      window.scrollY > startOfStickyContainer &&
      window.scrollY < startOfStickyContainer + window.innerHeight
    ) {
      console.log("scene 1");
    } else if (
      //scene 2
      window.scrollY > startOfStickyContainer + window.innerHeight &&
      window.scrollY < startOfStickyContainer + window.innerHeight * 2
    ) {
      console.log("scene 2");
    } else if (
      //scene 3
      window.scrollY > startOfStickyContainer + window.innerHeight * 2 &&
      window.scrollY < startOfStickyContainer + window.innerHeight * 3
    ) {
      console.log("scene 3");
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
