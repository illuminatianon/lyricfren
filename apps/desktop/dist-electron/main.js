import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath as fileURLToPath$1 } from "node:url";
import path$1 from "node:path";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
class CMUDictionaryService {
  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname2 = dirname(__filename);
    this.cmuDictPath = path.join(__dirname2, "..", "vendor", "cmudict", "cmudict-0.7b.json");
    this.loadDictionary();
  }
  loadDictionary() {
    try {
      const dictData = fs.readFileSync(this.cmuDictPath, "utf8");
      this.cmuDict = JSON.parse(dictData);
      console.log(`Loaded CMU dictionary with ${Object.keys(this.cmuDict).length} words`);
    } catch (error) {
      console.error("Error loading CMU dictionary:", error);
      this.cmuDict = {};
    }
  }
  getSyllableCount(word) {
    const cleanWord = word.replace(/[^\w'-]/g, "").toUpperCase();
    if (this.cmuDict[cleanWord]) {
      return this.cmuDict[cleanWord];
    }
    return null;
  }
}
const cmuDictionaryService = new CMUDictionaryService();
class MeterService {
  /**
   * Estimate syllables for words not in the dictionary
   * This is a very basic estimation and not very accurate
   * @param {string} word - The word to estimate syllables for
   * @returns {number} - The estimated number of syllables
   */
  estimateSyllables(word) {
    const vowels = ["A", "E", "I", "O", "U", "Y"];
    let count = 0;
    let prevIsVowel = false;
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !prevIsVowel) {
        count++;
      }
      prevIsVowel = isVowel;
    }
    if (word.length > 2 && word.endsWith("E") && !vowels.includes(word[word.length - 2])) {
      count = Math.max(1, count - 1);
    }
    return count || 1;
  }
  /**
   * Count syllables in a word using the CMU dictionary
   * @param {string} word - The word to count syllables for
   * @returns {number} - The number of syllables
   */
  countSyllables(word) {
    const dictCount = cmuDictionaryService.getSyllableCount(word);
    if (dictCount !== null) {
      return dictCount;
    }
    return this.estimateSyllables(word.toUpperCase());
  }
  /**
   * Count syllables in a line of text
   * @param {string} line - The line of text
   * @returns {number} - The total syllable count
   */
  countLineMetrics(line) {
    const trimmedLine = line.trim();
    if (trimmedLine === "") {
      return 0;
    }
    if (trimmedLine.startsWith("[") && trimmedLine.endsWith("]")) {
      return 0;
    }
    const withoutSectionMarkers = trimmedLine.replace(/\[.*?\]/g, "");
    if (withoutSectionMarkers.trim() === "") {
      return 0;
    }
    const cleanedLine = withoutSectionMarkers.replace(/\s+[^\w\s'-]+\s+/g, " ");
    const cleanedWords = cleanedLine.replace(/[^\w\s'-]+/g, "");
    const words = cleanedWords.split(/\s+/).filter((word) => word.length > 0);
    let totalSyllables = 0;
    for (const word of words) {
      totalSyllables += this.countSyllables(word);
    }
    return totalSyllables;
  }
  /**
   * Process text and return syllable counts for each line
   * @param {string} text - The text to analyze
   * @returns {Array} - Array of [line, syllableCount] pairs
   */
  processText(text) {
    const lines = text.split("\n");
    const result = [];
    for (const line of lines) {
      const syllableCount = this.countLineMetrics(line);
      result.push([line, syllableCount]);
    }
    return result;
  }
}
const meterService = new MeterService();
createRequire(import.meta.url);
const __dirname = path$1.dirname(fileURLToPath$1(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path$1.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$1.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  createWindow();
  ipcMain.handle("meter:processText", async (event, text) => {
    return meterService.processText(text);
  });
  ipcMain.handle("meter:countLine", async (event, line) => {
    return meterService.countLineMetrics(line);
  });
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
