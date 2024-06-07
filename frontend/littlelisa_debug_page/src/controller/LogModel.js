//==============
// Data Logger
//=============
function updateDataLog(logStr, logClassName) {
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
function sanitizeConsoleLog(logStr) {
  let sanitizedStr = logStr.substring(logStr.indexOf("("));

  sanitizedStr = sanitizedStr.substring(0, sanitizedStr.indexOf("[") - 1);
  return sanitizedStr;
}
