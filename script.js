import { wordleWords, dailyWordsSmall } from "./theWholeEnchilada.js";

let filteredWords = [...dailyWordsSmall];
let activeFilter = null;
let selectedLetter = null;
let selectedPosition = null;
let filterHistory = [];

// Create the keyboard layout
const keyboardLayout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

document.addEventListener("DOMContentLoaded", () => {
  createKeyboard();
  setupEventListeners();
  updateUI();
  displayResults(filteredWords);
});

function setupEventListeners() {
  // Filter button click handlers
  document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      handleFilterClick(filter);
    });
  });

  // Position button click handlers
  document.querySelectorAll(".position-button").forEach((button) => {
    button.addEventListener("click", () => {
      const position = parseInt(button.dataset.position);
      handlePositionClick(position);
    });
  });

  // Navigation button click handlers
  document.getElementById("backButton").addEventListener("click", handleBack);
  document.getElementById("resetButton").addEventListener("click", handleReset);
  document.getElementById("clearButton").addEventListener("click", handleClear);
}

function handleFilterClick(filter) {
  // Reset previous state
  selectedLetter = null;
  selectedPosition = null;
  document.querySelector(".position-buttons").classList.add("hidden");

  // Update active filter
  if (activeFilter === filter) {
    activeFilter = null;
    filteredWords = [...dailyWordsSmall];
    filterHistory = [];
  } else {
    activeFilter = filter;
    // Don't reset filteredWords here - keep current filtered state
  }

  // Update UI
  document.querySelectorAll(".filter-button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === activeFilter);
  });

  // Show position buttons if needed
  if (
    activeFilter &&
    (activeFilter === "containsLetterAtPosition" ||
      activeFilter === "containsLetterNotAtPosition")
  ) {
    document.querySelector(".position-buttons").classList.remove("hidden");
  }

  updateUI();
}

function handlePositionClick(position) {
  selectedPosition = position;

  // Update UI
  document.querySelectorAll(".position-button").forEach((btn) => {
    btn.classList.toggle("active", parseInt(btn.dataset.position) === position);
  });

  // If we have a letter selected, apply the filter immediately
  if (selectedLetter) {
    const newFilter = {
      type: activeFilter,
      letter: selectedLetter,
      position: selectedPosition,
    };
    filteredWords = applyFilter(filteredWords, newFilter);
    filterHistory.push(newFilter);
    displayResults(filteredWords);
  }

  updateUI();
}

function handleKeyPress(key) {
  if (!activeFilter) return;

  selectedLetter = key;
  const newFilter = {
    type: activeFilter,
    letter: key,
    position: selectedPosition,
  };

  // Apply the new filter to current filteredWords
  filteredWords = applyFilter(filteredWords, newFilter);
  filterHistory.push(newFilter);

  updateUI();
  displayResults(filteredWords);
}

function applyFilter(words, filter) {
  const { type, letter, position } = filter;
  const upperLetter = letter.toUpperCase();

  switch (type) {
    case "doesNotContainLetter":
      return words.filter((word) => !word.includes(upperLetter));
    case "containsLetterAtPosition":
      if (!position) return words; // Don't filter if no position selected
      return words.filter((word) => word[position - 1] === upperLetter);
    case "containsLetterNotAtPosition":
      if (!position) return words; // Don't filter if no position selected
      return words.filter(
        (word) =>
          word.includes(upperLetter) && word[position - 1] !== upperLetter
      );
    default:
      return words;
  }
}

function handleBack() {
  if (filterHistory.length === 0) return;

  // Remove the last filter
  filterHistory.pop();

  // Reset to initial state
  filteredWords = [...dailyWordsSmall];

  // Reapply all remaining filters
  filterHistory.forEach((filter) => {
    filteredWords = applyFilter(filteredWords, filter);
  });

  // Update the last filter state
  const lastFilter = filterHistory[filterHistory.length - 1];
  if (lastFilter) {
    activeFilter = lastFilter.type;
    selectedLetter = lastFilter.letter;
    selectedPosition = lastFilter.position;
  } else {
    activeFilter = null;
    selectedLetter = null;
    selectedPosition = null;
  }

  // Update UI
  document.querySelectorAll(".filter-button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === activeFilter);
  });
  document.querySelectorAll(".position-button").forEach((btn) => {
    btn.classList.toggle(
      "active",
      parseInt(btn.dataset.position) === selectedPosition
    );
  });
  document
    .querySelector(".position-buttons")
    .classList.toggle(
      "hidden",
      !activeFilter ||
        (activeFilter !== "containsLetterAtPosition" &&
          activeFilter !== "containsLetterNotAtPosition")
    );

  updateUI();
  displayResults(filteredWords);
}

function handleReset() {
  // Reset everything
  activeFilter = null;
  selectedLetter = null;
  selectedPosition = null;
  filteredWords = [...dailyWordsSmall];
  filterHistory = [];

  // Reset UI
  document.querySelectorAll(".filter-button").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelectorAll(".position-button").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelector(".position-buttons").classList.add("hidden");

  updateUI();
  displayResults(filteredWords);
}

function handleClear() {
  // Clear letter and position selections
  selectedLetter = null;
  selectedPosition = null;

  // Update UI
  document.querySelectorAll(".position-button").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Keep position buttons visible if the filter type requires them
  if (
    activeFilter &&
    (activeFilter === "containsLetterAtPosition" ||
      activeFilter === "containsLetterNotAtPosition")
  ) {
    document.querySelector(".position-buttons").classList.remove("hidden");
  }

  updateUI();
  // Don't change filteredWords or filterHistory
}

function createKeyboard() {
  const keyboardSection = document.querySelector(".keyboard-section");
  const keyboardContainer = document.createElement("div");
  keyboardContainer.className = "keyboard-container";

  keyboardLayout.forEach((row, rowIndex) => {
    const rowElement = document.createElement("div");
    rowElement.className = "keyboard-row";

    row.forEach((key) => {
      const keyElement = document.createElement("button");
      keyElement.className = "key";
      keyElement.textContent = key;
      keyElement.dataset.key = key;

      keyElement.addEventListener("click", () => handleKeyPress(key));
      rowElement.appendChild(keyElement);
    });

    keyboardContainer.appendChild(rowElement);
  });

  keyboardSection.appendChild(keyboardContainer);
}

function updateUI() {
  document.getElementById("currentFilter").textContent = activeFilter
    ? activeFilter.replace(/([A-Z])/g, " $1").trim()
    : "None";
  document.getElementById("currentLetter").textContent =
    selectedLetter || "None";
  document.getElementById("currentPosition").textContent =
    selectedPosition || "None";
}

function displayResults(results) {
  const resultsDiv = document.getElementById("filteredWords");
  const wordsList = results.join(", ");
  const totalWords = results.length;

  resultsDiv.innerHTML = `
    <div class="results-header">
      <span class="total-words">Total Words: ${totalWords}</span>
    </div>
    <div class="words-list">${wordsList}</div>
  `;
}
