let bar = document.getElementById("bar");
bar.style.cursor = "pointer";
let sidebar = document.getElementById("sidebar");
let display = document.getElementById("display");

bar.addEventListener("click", function () {
  if (sidebar.style.display === "none" || sidebar.style.display === "") {
    sidebar.style.display = "block";
    if (window.innerWidth > "1000px")
      display.style.width = "calc(100% - 230px)";
  } else {
    sidebar.style.display = "none";
    display.style.width = "100%";
  }
});

window.addEventListener("resize", function () {
  if (window.innerWidth < 1000) {
    sidebar.style.display = "none";
    display.style.width = "100%";
  } else {
    sidebar.style.display = "block";
    display.style.width = "calc(100% - 230px)";
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
    } else if (action === "uploadvideo") {
      message = "Login to upload videos";
    }else if (action === "uploadshort") {
      message = "Login to upload shorts";
    }else if (action === "uploadpost") {
      message = "Login to create posts";
    }

    showLoginPopup(message);
  }
});

document.addEventListener("click", function (e) {
  const bookmarkGuest = e.target.closest(".bookmark-guest");

  if (bookmarkGuest && !window.IS_LOGGED_IN) {
    e.preventDefault();
    showLoginPopup("Login to save this post");
  }
});