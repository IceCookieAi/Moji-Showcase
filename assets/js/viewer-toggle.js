/**
 * viewer-toggle.js
 * Логика сворачивания блока «Что может зритель» с сохранением в localStorage.
 */

function initViewerToggle() {
  const viewerSection = document.getElementById("viewer");
  const toggleBtn = document.getElementById("viewerToggle"); // Toggle inside section
  const showBtn = document.getElementById("showViewerBtn"); // Always visible toggle in header

  if (!viewerSection || !showBtn) return;

  const iconEye = showBtn.querySelector(".icon-eye");
  const iconEyeOff = showBtn.querySelector(".icon-eye-off");

  const updateUI = (isCollapsed) => {
    if (isCollapsed) {
      viewerSection.classList.add("is-collapsed");
      if (iconEye) iconEye.classList.add("is-hidden");
      if (iconEyeOff) iconEyeOff.classList.remove("is-hidden");
    } else {
      viewerSection.classList.remove("is-collapsed");
      if (iconEye) iconEye.classList.remove("is-hidden");
      if (iconEyeOff) iconEyeOff.classList.add("is-hidden");
    }
  };

  // Initial state
  const savedState = localStorage.getItem("viewerCollapsed") === "true";
  updateUI(savedState);

  // Both buttons should do the same thing now
  const handleToggle = () => {
    const isCollapsed = viewerSection.classList.toggle("is-collapsed");
    localStorage.setItem("viewerCollapsed", isCollapsed);
    updateUI(isCollapsed);
  };

  if (toggleBtn) toggleBtn.addEventListener("click", handleToggle);
  showBtn.addEventListener("click", handleToggle);
}
