/**
 * Returns a valid node class based on the given MAC address.
 * @param {string} macAddr - The MAC address of the node.
 * @returns {string} - The valid node class.
 */
export function getValidNodeClass(macAddr) {
  console.log("getting valid node class");
  return "node-" + macAddr.replaceAll(":", "-");
}
