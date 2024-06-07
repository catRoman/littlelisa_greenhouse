//++++++++++++++++++++++++++++++++++++
//+++++++++++++  /api/envState
//+++++++++++++++++++++++++++++++++++

async function fetchEnvState() {
  try {
    const response = await fetch("/api/envState");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    //apply to global
    envStateArr = Object.values(data);

    updateEnvStateView();
  } catch (error) {
    console.log(error.message);
  }
}
async function toggleStateFetch(id) {
  try {
    const response = await fetch("/api/envStateUpdate", {
      method: "PUT",
      body: id,
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const newState = await response.json();

    //apply to global

    fetchEnvState();
  } catch (error) {
    console.log(error.message);
  }
}

function updateEnvStateView() {
  const envContainer = document.querySelector(".env-cntrl");
  envContainer.innerHTML = "";

  envStateArr.forEach((relay) => {
    envContainer.insertAdjacentHTML(
      "beforeend",
      ` <li class="env-li" >
        <p>Id:${relay.id} &harr; P:${relay.pin} &harr; ${relay.type} &rarr;</p>
        <button data-id="${relay.id}" class="env-status ${
        relay.state === "on" ? "env-status-on" : "env-status-off"
      }">${relay.state}</button>
        </li>`
    );
  });
  const buttons = envContainer.querySelectorAll(".env-status");
  buttons.forEach((button) => {
    button.addEventListener("click", function (event) {
      const id = this.getAttribute("data-id");
      event.preventDefault();
      event.stopPropagation();
      toggleStateFetch(id);
    });
  });
}
fetchEnvState();
