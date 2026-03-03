const editor = document.getElementById("editor");
const lineCol = document.getElementById("line-col");
const zoomLabel = document.getElementById("zoom");
const statusBar = document.getElementById("status-bar");
const statusBarState = document.getElementById("status-bar-state");
const wordWrapState = document.getElementById("word-wrap-state");
const windowTitle = document.getElementById("window-title");
const fileInput = document.getElementById("file-input");

let zoomLevel = 100;
let hasSaved = false;
let currentFileName = "Untitled";

function updateTitle() {
  windowTitle.textContent = `${currentFileName} - Notepad`;
}

function updateCursorInfo() {
  const caret = editor.selectionStart;
  const textUntilCaret = editor.value.slice(0, caret);
  const lines = textUntilCaret.split("\n");
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  lineCol.textContent = `Ln ${line}, Col ${column}`;
}

function closeMenus() {
  document.querySelectorAll(".menu-item.open").forEach((item) => item.classList.remove("open"));
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function performAction(action) {
  switch (action) {
    case "new":
      if (editor.value && !confirm("Discard current text and create a new file?")) return;
      editor.value = "";
      currentFileName = "Untitled";
      hasSaved = false;
      updateTitle();
      updateCursorInfo();
      break;
    case "open":
      fileInput.click();
      break;
    case "save":
      if (!hasSaved || currentFileName === "Untitled") {
        performAction("save-as");
        return;
      }
      downloadText(`${currentFileName}.txt`, editor.value);
      break;
    case "save-as": {
      const requested = prompt("Save file as:", currentFileName);
      if (!requested) return;
      currentFileName = requested.replace(/\.txt$/i, "") || "Untitled";
      hasSaved = true;
      updateTitle();
      downloadText(`${currentFileName}.txt`, editor.value);
      break;
    }
    case "print":
      window.print();
      break;
    case "exit":
      alert("In a browser demo, Exit cannot close the tab unless it was opened by script.");
      break;
    case "undo":
    case "redo":
    case "cut":
    case "copy":
    case "paste":
    case "delete":
      document.execCommand(action);
      break;
    case "select-all":
      editor.select();
      updateCursorInfo();
      break;
    case "time-date": {
      const stamp = new Date().toLocaleString();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.setRangeText(stamp, start, end, "end");
      updateCursorInfo();
      break;
    }
    case "word-wrap":
      editor.classList.toggle("no-wrap");
      wordWrapState.textContent = editor.classList.contains("no-wrap") ? "" : "✓";
      break;
    case "font-size-up": {
      const size = Number.parseFloat(getComputedStyle(editor).fontSize);
      editor.style.fontSize = `${Math.min(size + 1, 40)}px`;
      break;
    }
    case "font-size-down": {
      const size = Number.parseFloat(getComputedStyle(editor).fontSize);
      editor.style.fontSize = `${Math.max(size - 1, 9)}px`;
      break;
    }
    case "zoom-in":
      zoomLevel = Math.min(500, zoomLevel + 10);
      editor.style.zoom = `${zoomLevel}%`;
      zoomLabel.textContent = `${zoomLevel}%`;
      break;
    case "zoom-out":
      zoomLevel = Math.max(20, zoomLevel - 10);
      editor.style.zoom = `${zoomLevel}%`;
      zoomLabel.textContent = `${zoomLevel}%`;
      break;
    case "zoom-reset":
      zoomLevel = 100;
      editor.style.zoom = "100%";
      zoomLabel.textContent = "100%";
      break;
    case "status-bar":
      statusBar.classList.toggle("hidden");
      statusBarState.textContent = statusBar.classList.contains("hidden") ? "" : "✓";
      break;
    case "view-help":
      alert("Notepad Help\n\nUse File to open/save text files and Edit for basic editing commands.");
      break;
    case "about":
      alert("Notepad\nWindows 10 styled web clone\nVersion 1.0");
      break;
    default:
      break;
  }
}

document.querySelectorAll(".menu-trigger").forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    const item = event.currentTarget.parentElement;
    const isOpen = item.classList.contains("open");
    closeMenus();
    if (!isOpen) item.classList.add("open");
  });
});

document.querySelectorAll(".dropdown-menu li[data-action]").forEach((option) => {
  option.addEventListener("click", (event) => {
    performAction(event.currentTarget.dataset.action);
    closeMenus();
    editor.focus();
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".menu-item")) closeMenus();
});

fileInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (readEvent) => {
    editor.value = String(readEvent.target.result ?? "");
    currentFileName = file.name.replace(/\.txt$/i, "") || "Untitled";
    hasSaved = true;
    updateTitle();
    updateCursorInfo();
  };
  reader.readAsText(file);
  fileInput.value = "";
});

editor.addEventListener("keyup", updateCursorInfo);
editor.addEventListener("click", updateCursorInfo);
editor.addEventListener("input", updateCursorInfo);

updateTitle();
updateCursorInfo();
