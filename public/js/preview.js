  const thumbInput = document.getElementById("thumbnail");
  const preview = document.getElementById("thumbPreview");

  if (thumbInput) {
    thumbInput.addEventListener("change", () => {
      const file = thumbInput.files[0];
      if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
      }
    });
  }