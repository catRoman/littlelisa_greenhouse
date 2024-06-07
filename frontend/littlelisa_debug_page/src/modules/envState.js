/**
 * Updates the environment state view by rendering the on/off status buttons.
 */
export function updateEnvStateView() {
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
