import "./css/index.css";
import javascriptLogo from "./javascript.svg";
document.addEventListener("scroll", () => {
  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;

  const scrollContainer = document.querySelector(".scroll-container");
  const content1 = document.querySelector(".sensor");
  const content2 = document.querySelector(".enviromental-control");
  const content3 = document.querySelector(".history");
  const content4 = document.querySelector(".debug");

  // Apply sticky class when the scroll position reaches the container's top
  if (scrollPosition > scrollContainer.offsetTop) {
    scrollContainer.classList.add("sticky");
  } else {
    scrollContainer.classList.remove("sticky");
  }

  const threshold1 = windowHeight * 0.5;
  const threshold2 = windowHeight * 1.5;
  const threshold3 = windowHeight * 2.5;
  const threshold4 = windowHeight * 3.5;

  if (scrollPosition < threshold1) {
    content1.style.opacity = 1;
    content2.style.opacity = 0;
    content3.style.opacity = 0;
    content4.style.opacity = 0;
  } else if (scrollPosition < threshold2) {
    content1.style.opacity = 0;
    content2.style.opacity = 1;
    content3.style.opacity = 0;
    content4.style.opacity = 0;
  } else if (scrollPosition < threshold3) {
    content1.style.opacity = 0;
    content2.style.opacity = 0;
    content3.style.opacity = 1;
    content4.style.opacity = 0;
  } else if (scrollPosition < threshold4) {
    content1.style.opacity = 0;
    content2.style.opacity = 0;
    content3.style.opacity = 0;
    content4.style.opacity = 1;
  }
});
