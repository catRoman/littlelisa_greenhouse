//+++++++++++OTA UPDATE+++++++++++++++

const otaUpdateBtn = document.getElementById("uploadBtn");
const otaUpdateForm = document.getElementById("uploadForm");

otaUpdateForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent the default form submission
  //this.disable = true;
  otaUpdateBtn.disabled = true;

  const file = fileInput.files[0]; // Get the file from the file input
  const url = "ota/update_prop";

  otaStatusContainer.classList.toggle("hidden");
  // logDataSocket.onmessage = (event) => {
  //   updateDataLog(event.data, "ota-log");
  // };

  try {
    // initiateLogSocket(moduleData, "update");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: file, // Send the file as the request body
    });

    if (!response.ok) {
      throw new Error(`Status: ${response.status}`);
    } else {
      const data = await response.text();
      console.log(data);
      otaStatusInfo.textContent = "Upload Complete...";
      // setTimeout(() => {
      //   otaStatusInfo.textContent = "Preforming updates...";
      //   otaStatusReset.textContent = "Manually reload in on completion...";
      // }, 3000);
      // setTimeout(() => {
      //   location.reload(true);
      // }, 30000);
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    setTimeout(() => {
      otaStatusInfo.textContent = "SD save failed...";
      otaStatusReset.textContent = error;
    }, 10000);
    otaStatusContainer.classList.toggle("hidden");
    otaUpdateBtn.disabled = false;
  }
});
