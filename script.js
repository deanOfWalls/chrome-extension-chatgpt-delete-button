console.log("✅ ChatGPT Delete Button Extension: Running!");

(function() {
  if (!window.location.hostname.includes("chat.openai.com") && !window.location.hostname.includes("chatgpt.com")) return;

  if (document.getElementById("delete-chat-button-container")) {
    console.log("✅ Delete button already injected.");
    return;
  }

  const savedPosition = JSON.parse(localStorage.getItem("deleteButtonPosition")) || { top: 100, left: 20 };

  const container = document.createElement("div");
  container.id = "delete-chat-button-container";
  Object.assign(container.style, {
    position: "fixed",
    top: `${savedPosition.top}px`,
    left: `${savedPosition.left}px`,
    zIndex: "999999",
  });

  document.body.appendChild(container);

  const button = document.createElement("button");
  button.innerText = "🗑️ Delete Chat";

  Object.assign(button.style, {
    padding: "12px 18px",
    fontSize: "16px",
    fontWeight: "bold",
    backgroundColor: "#ff4d4f",
    color: "white",
    border: "2px solid black",
    borderRadius: "10px",
    cursor: "grab",
    opacity: "0.95",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
  });

  container.appendChild(button);

  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let moved = false;

  button.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;

    function moveAt(pageX, pageY) {
      const dx = pageX - dragStartX;
      const dy = pageY - dragStartY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;

      const left = pageX - (e.offsetX || button.clientWidth / 2);
      const top = pageY - (e.offsetY || button.clientHeight / 2);

      container.style.left = `${left}px`;
      container.style.top = `${top}px`;

      localStorage.setItem("deleteButtonPosition", JSON.stringify({ top, left }));
    }

    function onMouseMove(e) {
      moveAt(e.pageX, e.pageY);
    }

    document.addEventListener("mousemove", onMouseMove);

    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
    }, { once: true });
  });

  button.ondragstart = () => false;

  button.addEventListener("click", async () => {
    if (moved) {
      console.log("⏳ Button was dragged, not clicked.");
      moved = false;
      return;
    }

    const conversationId = window.location.pathname.split("/")[2];
    if (!conversationId) {
      alert("No conversation ID found in URL.");
      return;
    }

    chrome.storage.local.get("authToken", async ({ authToken }) => {
      if (!authToken) {
        alert("Auth token not found.");
        return;
      }

      const confirmed = confirm("Are you sure you want to delete this conversation?");
      if (!confirmed) return;

      const origin = window.location.origin;

      try {
        const res = await fetch(`${origin}/backend-api/conversation/${conversationId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({
            is_visible: false
          })
        });

        if (res.ok) {
          alert("Conversation deleted! Refreshing...");
          window.location.href = "/";
        } else {
          alert("Failed to delete conversation.");
        }
      } catch (error) {
        alert("Error deleting conversation: " + error.message);
      }
    });
  });

})();
