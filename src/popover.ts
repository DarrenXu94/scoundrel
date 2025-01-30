export function handlePopover() {
  // attempt to load cookie from local storage
  // if exists, dont show popover, else show popover

  const popover = document.getElementById("game-rules-popover")!;
  const closeBtn = document.getElementById("close-popover")!;

  // get cookie
  const hasVisited = localStorage.getItem("hasVisited");

  if (!hasVisited) {
    popover.showPopover();
  } else {
    popover.hidePopover();
  }

  closeBtn.addEventListener("click", () => {
    popover.hidePopover();
    localStorage.setItem("hasVisited", "true");
  });
}
