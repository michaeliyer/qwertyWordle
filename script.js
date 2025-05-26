import { wordleWords, dailyWordsSmall } from "./theWholeEnchilada.js";

let filteredWords = [...dailyWordsSmall];
let activeFilter = null;
let selectedLetter = null;
let selectedPosition = null;
let filterHistory = [];

// Theme toggle functionality
let isCyberMode = false;
const themeToggle = document.getElementById("themeToggle");
const themeStylesheet = document.getElementById("theme-stylesheet");
const cyberLetters = document.getElementById("cyberLetters");

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

  // Theme toggle functionality
  themeToggle.addEventListener("click", toggleTheme);
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

  // Update keyboard keys
  updateKeyboardKeys();
  updateUI();
  displayResults(filteredWords);
}

function updateKeyboardKeys() {
  const keyboardKeys = document.querySelectorAll(".key");
  const eliminatedLetters = new Set();
  const confirmedLetters = new Set();
  const presentLetters = new Set();

  // Find all eliminated, confirmed, and present letters
  filterHistory.forEach((filter) => {
    if (filter.type === "doesNotContainLetter") {
      eliminatedLetters.add(filter.letter);
    } else if (filter.type === "containsLetterAtPosition") {
      confirmedLetters.add(filter.letter);
    } else if (filter.type === "containsLetterNotAtPosition") {
      presentLetters.add(filter.letter);
    }
  });

  // Update each key
  keyboardKeys.forEach((key) => {
    const letter = key.dataset.key;
    key.classList.toggle("eliminated", eliminatedLetters.has(letter));
    key.classList.toggle("confirmed", confirmedLetters.has(letter));
    key.classList.toggle(
      "present",
      presentLetters.has(letter) &&
        !confirmedLetters.has(letter) &&
        !eliminatedLetters.has(letter)
    );
  });
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

  updateKeyboardKeys();
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

  updateKeyboardKeys();
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

  updateKeyboardKeys();
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

  // Calculate letter frequencies
  const frequencies = {};
  for (let i = 0; i < 26; i++) {
    frequencies[String.fromCharCode(65 + i)] = 0;
  }
  results.forEach((word) => {
    for (const char of word.toUpperCase()) {
      if (frequencies.hasOwnProperty(char)) {
        frequencies[char]++;
      }
    }
  });

  // Render frequency bar as a table with zero class
  const freqBar = `
    <table class="letter-frequency-bar" style="margin: 0.5em auto 1em auto; border-collapse: collapse;">
      <tr>
        ${Object.keys(frequencies)
          .map((l) => {
            const zero = frequencies[l] === 0 ? "letter-zero" : "";
            return `<th class="${zero}" style="padding:2px 4px; font-weight:bold; font-size:0.95em;">${l}</th>`;
          })
          .join("")}
      </tr>
      <tr>
        ${Object.values(frequencies)
          .map((c, i) => {
            const zero = c === 0 ? "letter-zero" : "";
            return `<td class="${zero}" style="padding:2px 4px; font-size:0.95em; text-align:center;">${c}</td>`;
          })
          .join("")}
      </tr>
    </table>
  `;

  resultsDiv.innerHTML = `
    <div class="results-header">
      <span class="total-words">Total Words: ${totalWords}</span>
    </div>
    ${freqBar}
    <div class="words-list">${wordsList}</div>
  `;
}

// Create falling letters
function createFallingLetters() {
  const container = document.getElementById("cyberLetters");
  if (!container) return;

  // Clear existing letters
  container.innerHTML = "";

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numLetters = 500; // Increased number for better coverage
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Create a grid of potential starting positions
  const gridSize = 10;
  const positions = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      positions.push({
        x: (i / gridSize) * viewportWidth,
        y: (j / gridSize) * viewportHeight,
      });
    }
  }

  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  for (let i = 0; i < numLetters; i++) {
    const letter = document.createElement("div");
    letter.className = "cyber-letter";
    letter.textContent = alphabet[Math.floor(Math.random() * alphabet.length)];

    // Use shuffled positions
    const pos = positions[i % positions.length];
    const randomOffset = (Math.random() - 0.5) * 100; // Random offset for more scatter

    // Random animation duration between 4-6 seconds for more consistent falling
    const duration = 4 + Math.random() * 2;

    // Set CSS custom properties
    letter.style.setProperty("--random", Math.random());
    letter.style.setProperty("--duration", `${duration}s`);
    letter.style.left = `${pos.x + randomOffset}px`;
    letter.style.top = `-50px`; // Start above the viewport

    // Random rotation and scale for more variety
    letter.style.setProperty("--rotation", `${Math.random() * 360}deg`);
    letter.style.setProperty("--scale", `${0.8 + Math.random() * 0.4}`);

    container.appendChild(letter);
  }
}

// Toggle theme
function toggleTheme() {
  isCyberMode = !isCyberMode;
  themeStylesheet.disabled = !isCyberMode;
  themeToggle.textContent = isCyberMode ? "Normal Mode" : "Cyber Mode";

  if (isCyberMode) {
    createFallingLetters();
  } else {
    cyberLetters.innerHTML = "";
  }
}

console.log(keyboardLayout);
