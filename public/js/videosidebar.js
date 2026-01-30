  const bar = document.getElementById("bar");
  const videosidebar = document.getElementById("videosidebar");
  const display = document.getElementById("display");
  const page = document.querySelector(".page-layout");
  bar.style.cursor = "pointer";
  bar.addEventListener("click", () => {
    const isOpen = page.classList.contains("sidebar-open");
    if (isOpen) {
      page.classList.remove("sidebar-open");
      videosidebar.style.display = "none";
      display.style.width = "100%";
    } else {
      page.classList.add("sidebar-open");
      videosidebar.style.display = "block";
      if (window.innerWidth > 1000) {
        display.style.width = "calc(100% - 230px)";
      }
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth < 1000) {
      page.classList.remove("sidebar-open");
      videosidebar.style.display = "none";
      display.style.width = "100%";
    }
  });


document.addEventListener("click", function (e) {
  const sidebarGuest = e.target.closest(".sidebar-guest");
  if (sidebarGuest && !window.IS_LOGGED_IN) {
    e.preventDefault();
    const action = sidebarGuest.dataset.action;
    let message = "Please login to continue";
    if (action === "saved-videos") {
      message = "Login to view your saved videos";
    } else if (action === "saved-posts") {
      message = "Login to view your saved posts";
    } else if (action === "followings") {
      message = "Login to view your followings";
    }
    showLoginPopup(message);
  }
});