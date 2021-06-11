const humberg = document.querySelector(".humberg");
const navbarNavMobile = document.querySelector(".navbar__navmobile");
const testimony = document.querySelectorAll(".testimony");
const body = document.querySelector("body");

humberg.addEventListener("click", handleHumbergClick);
let slideIndex = 0;
showSlides();

function showSlides() {
  var i;
  var slides = document.getElementsByClassName("testimony");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";

    slides[i].classList.remove("fade-in");
  }
  slideIndex++;
  if (slideIndex > slides.length) {
    slideIndex = 1;
  }
  slides[slideIndex - 1].style.display = "flex";
  slides[slideIndex - 1].classList.add("fade-in");
  // slides[slideIndex - 1].classList.add("fade-out");
  setTimeout(showSlides, 5000); // Change image every 10 seconds
}

function handleHumbergClick(e) {
  navbarNavMobile.classList.toggle("hide");
  body.classList.toggle("no-scroll");
}
