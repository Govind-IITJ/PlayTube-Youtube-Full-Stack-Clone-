const videos = document.querySelectorAll(".shorts-video-player");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.currentTime = 0;
        video.play();
      } else {
        video.pause();
      }
    });
  },
  {
    threshold: 0.8,
  },
);
videos.forEach((video) => {
  observer.observe(video);
  video.addEventListener("click", () => {
    video.paused ? video.play() : video.pause();
  });
});


document.addEventListener("click", function (e) {
  const followGuest = e.target.closest(".follow-guest");

  if (followGuest && !window.IS_LOGGED_IN) {
    e.preventDefault();
    showLoginPopup("Login to follow this creator");
  }
});


document.querySelectorAll(".shorts-int-box").forEach((box) => {
  const likeBox = box.querySelector(".like-box");
  const dislikeBox = box.querySelector(".dislike-box");

  const likeIcon = likeBox.querySelector(".like-icon");
  const likeText = likeBox.querySelector(".like-text");

  const dislikeIcon = dislikeBox.querySelector(".dislike-icon");
  const dislikeText = dislikeBox.querySelector(".dislike-text");

  likeBox.addEventListener("click", (e) => {
    if (!window.IS_LOGGED_IN) {
      e.preventDefault();
      showLoginPopup("Login to like this short");
      return;
    }

    const isActive = likeIcon.classList.contains("active");

    dislikeIcon.classList.remove("active");
    dislikeText.classList.remove("active");
    dislikeText.textContent = "Dislike";

    if (isActive) {
      likeIcon.classList.remove("active");
      likeText.classList.remove("active");
      likeText.textContent = "Like";
    } else {
      likeIcon.classList.add("active");
      likeText.classList.add("active");
      likeText.textContent = "Liked";
    }
  });

  dislikeBox.addEventListener("click", (e) => {
    if (!window.IS_LOGGED_IN) {
      e.preventDefault();
      showLoginPopup("Login to dislike this short");
      return;
    }

    const isActive = dislikeIcon.classList.contains("active");

    likeIcon.classList.remove("active");
    likeText.classList.remove("active");
    likeText.textContent = "Like";

    if (isActive) {
      dislikeIcon.classList.remove("active");
      dislikeText.classList.remove("active");
      dislikeText.textContent = "Dislike";
    } else {
      dislikeIcon.classList.add("active");
      dislikeText.classList.add("active");
      dislikeText.textContent = "Disliked";
    }
  });
});

// SAVE
document.querySelectorAll(".save-box").forEach((box) => {
  box.addEventListener("click", () => {
    const icon = box.querySelector(".save-icon");
    const text = box.querySelector(".save-text");

    const active = icon.classList.toggle("active");
    text.textContent = active ? "Saved" : "Save";
    text.classList.toggle("active", active);
  });
});

function setVH() {
  document.documentElement.style.setProperty(
    "--vh",
    `${window.innerHeight * 0.01}px`,
  );
}
setVH();
window.addEventListener("resize", setVH);

document.querySelectorAll(".copy-box").forEach((btn) => {
  btn.addEventListener("click", () => {
    const shortId = btn.dataset.shortid;

    const link = `${window.location.origin}/shorts?shortId=${shortId}`;

    navigator.clipboard.writeText(link).then(() => {
      const text = btn.querySelector(".copy-text");
      text.textContent = "Copied!";
      text.style.color = "#065fd4";

      setTimeout(() => {
        text.textContent = "Copylink";
        text.style.color = "";
      }, 1200);
    });
  });
});

document.querySelectorAll(".reload-box").forEach((box) => {
  box.addEventListener("click", () => {
    const video = box
      .closest(".shortsbox")
      .querySelector(".shorts-video-player");

    if (video) {
      video.currentTime = 0;
      video.play();
    }
  });
});

let activeMenu = null;

document.querySelectorAll(".shortsbox").forEach((box) => {
  const video = box.querySelector(".shorts-video-player");
  const menuBtn = box.querySelector(".shorts-options-btn");
  const menu = box.querySelector(".shorts-options-menu");

  if (!menuBtn || !menu || !video) return;

  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    if (activeMenu && activeMenu !== menu) {
      activeMenu.style.display = "none";
    }

    const isOpen = menu.style.display === "block";
    menu.style.display = isOpen ? "none" : "block";
    activeMenu = isOpen ? null : menu;
  });

  menu.addEventListener("click", (e) => {
    e.stopPropagation();
    const action = e.target.dataset.action;
    if (!action) return;

    switch (action) {
      case "play":
        video.paused ? video.play() : video.pause();
        break;

      case "mute":
        video.muted = !video.muted;
        break;

      case "restart":
        video.currentTime = 0;
        video.play();
        break;
    }

    menu.style.display = "none";
    activeMenu = null;
  });
});

document.addEventListener("click", () => {
  if (activeMenu) {
    activeMenu.style.display = "none";
    activeMenu = null;
  }
});

document.querySelectorAll(".shorts-video-player").forEach(video => {
  const loader = video.previousElementSibling;

  video.addEventListener("canplay", () => {
    if (loader) loader.style.display = "none";
  });
});
