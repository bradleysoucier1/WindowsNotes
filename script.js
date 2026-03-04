const editor = document.getElementById("editor");
const lineCol = document.getElementById("line-col");
const zoomLabel = document.getElementById("zoom");
const statusBar = document.getElementById("status-bar");
const statusBarState = document.getElementById("status-bar-state");
const wordWrapState = document.getElementById("word-wrap-state");
const darkModeState = document.getElementById("dark-mode-state");
const windowTitle = document.getElementById("window-title");
const fileInput = document.getElementById("file-input");

let zoomLevel = 100;
let hasSaved = false;
let currentFileName = "Untitled";
let lastSearchTerm = "";

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

function findNextOccurrence(term, fromIndex = editor.selectionEnd) {
  const text = editor.value;
  const index = text.toLowerCase().indexOf(term.toLowerCase(), fromIndex);
  if (index === -1) return false;
  editor.focus();
  editor.setSelectionRange(index, index + term.length);
  updateCursorInfo();
  return true;
}

function setFontFamily(name) {
  editor.style.fontFamily = name;
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
    case "new-window":
      window.open(window.location.href, "_blank");
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
    case "page-setup":
      alert("Page Setup is not supported in-browser. Use Print settings in your browser.");
      break;
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
    case "find": {
      const term = prompt("Find:", lastSearchTerm);
      if (!term) return;
      lastSearchTerm = term;
      if (!findNextOccurrence(term, 0)) alert(`Cannot find \"${term}\"`);
      break;
    }
    case "find-next":
      if (!lastSearchTerm) {
        alert("Use Find first to set a search term.");
        return;
      }
      if (!findNextOccurrence(lastSearchTerm, editor.selectionEnd)) {
        if (!findNextOccurrence(lastSearchTerm, 0)) alert(`Cannot find \"${lastSearchTerm}\"`);
      }
      break;
    case "replace": {
      const findText = prompt("Find what:", lastSearchTerm);
      if (!findText) return;
      const replaceWith = prompt("Replace with:", "");
      if (replaceWith === null) return;
      lastSearchTerm = findText;
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      editor.value = editor.value.replace(regex, replaceWith);
      updateCursorInfo();
      break;
    }
    case "go-to": {
      const value = prompt("Go to line:", "1");
      if (!value) return;
      const targetLine = Number.parseInt(value, 10);
      if (Number.isNaN(targetLine) || targetLine < 1) return;
      const lines = editor.value.split("\n");
      let index = 0;
      for (let i = 0; i < Math.min(targetLine - 1, lines.length - 1); i += 1) index += lines[i].length + 1;
      editor.focus();
      editor.setSelectionRange(index, index);
      updateCursorInfo();
      break;
    }
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
    case "font-reset":
      editor.style.fontSize = "1rem";
      setFontFamily('"Consolas", "Lucida Console", monospace');
      break;
    case "font-family": {
      const choice = prompt("Font family:", getComputedStyle(editor).fontFamily);
      if (!choice) return;
      setFontFamily(choice);
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
    case "toggle-dark-mode":
      document.body.classList.toggle("dark");
      darkModeState.textContent = document.body.classList.contains("dark") ? "✓" : "";
      break;
    case "view-help":
      alert("Notepad Help\n\nUse File to open/save text files and Edit for basic editing commands.");
      break;
    case "keyboard-shortcuts":
      alert("Shortcuts\nCtrl+S Save\nCtrl+F Find\nCtrl+H Replace\nCtrl+A Select All");
      break;
    case "about":
      alert("Notepad\nWindows 10 styled web clone\nVersion 1.1");
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

document.addEventListener("keydown", (event) => {
  if (!event.ctrlKey) return;
  const key = event.key.toLowerCase();
  if (key === "s") {
    event.preventDefault();
    performAction("save");
  } else if (key === "f") {
    event.preventDefault();
    performAction("find");
  } else if (key === "h") {
    event.preventDefault();
    performAction("replace");
  }
});

editor.addEventListener("keyup", updateCursorInfo);
editor.addEventListener("click", updateCursorInfo);
editor.addEventListener("input", updateCursorInfo);

updateTitle();
updateCursorInfo();
