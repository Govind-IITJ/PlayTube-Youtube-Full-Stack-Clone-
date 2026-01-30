const commentInput = document.getElementById("commentplace");
const commentActions = document.querySelector(".comment-actions");
const cancelButton = document.querySelector(".comment-cancel");
const commentForm = document.getElementById("addcomment");

if (commentForm) {
  commentForm.addEventListener("submit", function (e) {
    if (!window.IS_LOGGED_IN) {
      e.preventDefault();
      showLoginPopup("Please login to add a comment");
      return;
    }
  });
}

document.addEventListener("click", function (e) {
  const followGuest = e.target.closest(".follow-guest");
  const saveGuest = e.target.closest(".save-guest");

  if ((saveGuest) && !window.IS_LOGGED_IN) {
    showLoginPopup("Please login to save videos");
    return;
  }

  if ((followGuest) && !window.IS_LOGGED_IN) {
    showLoginPopup("Please login to follow creators");
    return;
  }
});


// show actions on focus
commentInput.addEventListener("focus", function () {
  commentActions.style.display = "flex";
});

// cancel button behavior
cancelButton.addEventListener("click", function () {
  commentInput.value = "";
  commentInput.blur();
  commentActions.style.display = "none";
});

document.addEventListener("click", function (e) {
  const allMenus = document.querySelectorAll(".comment-dropdown");
  allMenus.forEach((menu) => {
    menu.style.display = "none";
  });
  const menuIcon = e.target.closest(".comment-menu i");
  if (menuIcon) {
    const menu = menuIcon.parentElement.querySelector(".comment-dropdown");
    menu.style.display = "block";
    e.stopPropagation();
  }
});

document.addEventListener("click", function (e) {
  const likeBtn = e.target.closest(".comment-like");
  const dislikeBtn = e.target.closest(".comment-dislike");

  if ((likeBtn || dislikeBtn) && !window.IS_LOGGED_IN) {
    showLoginPopup("Please login to like or dislike comments");
    return;
  }

  if (likeBtn) {
    const container = likeBtn.closest(".comment-reactions");
    container.querySelector(".comment-dislike").classList.remove("active");
    likeBtn.classList.toggle("active");
  }

  if (dislikeBtn) {
    const container = dislikeBtn.closest(".comment-reactions");
    container.querySelector(".comment-like").classList.remove("active");
    dislikeBtn.classList.toggle("active");
  }
});

const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");

if (likeBtn && dislikeBtn) {
  likeBtn.addEventListener("click", () => {
    if (!window.IS_LOGGED_IN) {
      showLoginPopup("Please login to like or dislike videos");
      return;
    }
    likeBtn.classList.add("active");
    dislikeBtn.classList.remove("active");
  });

  dislikeBtn.addEventListener("click", () => {
    if (!window.IS_LOGGED_IN) {
      showLoginPopup("Please login to like or dislike videos");
      return;
    }
    dislikeBtn.classList.add("active");
    likeBtn.classList.remove("active");
  });
}

document.querySelectorAll(".save-form").forEach((form) => {
  const btn = form.querySelector(".save-btn");
  const icon = btn.querySelector("i");
  const text = btn.querySelector(".interactname");
  btn.addEventListener("click", () => {
    // toggle UI instantly (form will still submit)
    if (btn.classList.contains("saved")) {
      btn.classList.remove("saved");
      text.color = "black";
    } else {
      btn.classList.add("saved");
      text.textContent = "Saved";
    }
  });
});

const copyBtn = document.getElementById("copyLinkBtn");

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    copyBtn.classList.add("copied");

    const text = copyBtn.querySelector(".interactname");
    text.textContent = "Copied!";

    setTimeout(() => {
      copyBtn.classList.remove("copied");
      text.textContent = "Copylink";
    }, 1200);
  });
});

const repeatBtn = document.getElementById("videorepeatBtn");
const video = document.querySelector("video");

repeatBtn.addEventListener("click", () => {
  if (!video) return;

  video.currentTime = 0;
  video.play();

  repeatBtn.classList.add("active");

  setTimeout(() => {
    repeatBtn.classList.remove("active");
  }, 300);
});
