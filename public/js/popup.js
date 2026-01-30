function showLoginPopup(message) {
  const popup = document.getElementById("login-popup");
  const msg = document.getElementById("popup-message");
  const loginBtn = document.getElementById("popup-login-btn");

  if (!popup || !msg || !loginBtn) return;

  msg.textContent = message;

  const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
  loginBtn.href = `/login?returnTo=${returnTo}`;

  popup.style.display = "flex";
}

document.addEventListener("click", (e) => {
  if (e.target.id === "popup-close") {
    document.getElementById("login-popup").style.display = "none";
  }
});
