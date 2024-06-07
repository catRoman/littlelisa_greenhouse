/**
 *
 * @fileoverview This file contains functions for updating the data log from websocket messages.
 */

//esp-log elements
const logTextArea = document.querySelector(".log-output");
const logRefreshBtn = document.querySelector(".log-refresh");

/**
 * Updates the data log with the provided log string and log class name.
 * @param {string} logStr - The log string to be added to the data log.
 * @param {string} logClassName - The class name of the log box element.
 */
export function updateDataLog(logStr, logClassName) {
  const MAX_CHARS = 100000;
  const logBox = document.querySelector(`.${logClassName}`);

  const isScrolledToBottom =
    logBox.scrollHeight - logBox.clientHeight <= logBox.scrollTop + 1;

  logBox.value += (logBox.value ? "\n" : "") + sanitizeConsoleLog(logStr);

  if (logBox.value.length > MAX_CHARS) {
    let excess = logBox.value.length - MAX_CHARS;
    let newValue = logBox.value.substring(excess);
    logBox.value = "...[truncated]...\n" + newValue;
  }

  if (isScrolledToBottom) {
    logBox.scrollTop = logBox.scrollHeight;
  }
}
/**
 * Sanitizes the console log string by removing unnecessary console color information.
 *
 * @param {string} logStr - The console log string to be sanitized.
 * @returns {string} - The sanitized console log string.
 */
export function sanitizeConsoleLog(logStr) {
  let sanitizedStr = logStr.substring(logStr.indexOf("("));

  sanitizedStr = sanitizedStr.substring(0, sanitizedStr.indexOf("[") - 1);
  return sanitizedStr;
}
