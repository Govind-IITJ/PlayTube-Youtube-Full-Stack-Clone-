const searchInput = document.getElementById("searchbar");
const searchIcon = document.getElementById("searchicon1");

function performSearch() {
  const query = searchInput.value.trim();
  if (query !== "") {
    window.location.href = `/videos/search?q=${encodeURIComponent(query)}`;
  }
}

// Click on icon
searchIcon.addEventListener("click", performSearch);

// Press Enter in input
searchInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    performSearch();
  }
});

const micBtn = document.getElementById("micebox");
const searchBox = document.getElementById("searchbar");
const listen = document.getElementById("listen");
const listen_int = document.getElementById("listen-int");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

micBtn.addEventListener("click", () => {
  listen_int.textContent = "Listening...";
  listen.style.display = "flex";
  recognition.start();
});
recognition.addEventListener("result", (event) => {
  const speechResult = event.results[0][0].transcript.trim();
  searchBox.value = speechResult;
  console.log("Voice input:", speechResult);
  if (speechResult !== "") {
    listen_int.textContent = speechResult;
    setTimeout(() => {
      listen.style.display = "none";
      window.location.href = `/videos/search?q=${encodeURIComponent(speechResult)}`;
    }, 800);
  }
});
recognition.addEventListener("end", () => {
  console.log("Speech recognition ended.");
  listen.style.display = "none";
});

const profileIcon = document.getElementById("userid");
const profileMenu = document.getElementById("profile-menu");
const notificationBtn = document.getElementById("notification");
const notificationScreen = document.getElementById("notification-screen");

// Toggle profile menu
profileIcon.addEventListener("click", function (e) {
  e.stopPropagation();
  profileMenu.style.display =
    profileMenu.style.display === "block" ? "none" : "block";
});

// Toggle notification screen
notificationBtn.addEventListener("click", function (e) {
  e.stopPropagation();
  notificationScreen.style.display = "flex";
});

// Close notification screen on click outside
notificationScreen.addEventListener("click", function () {
  notificationScreen.style.display = "none";
});

// Close menus when clicking anywhere else
document.addEventListener("click", function () {
  profileMenu.style.display = "none";
  notificationScreen.style.display = "none";
});

document.addEventListener("click", function (e) {
  const uploadGuest = e.target.closest(".upload-guest");

  if (uploadGuest && !window.IS_LOGGED_IN) {
    e.preventDefault();

    const action = uploadGuest.dataset.action;

    let message = "Please login to continue";
    if (action === "video") {
      message = "Login to upload a video";
    } else if (action === "short") {
      message = "Login to create a short";
    } else if (action === "post") {
      message = "Login to create a community post";
    }

    showLoginPopup(message);
  }
});
