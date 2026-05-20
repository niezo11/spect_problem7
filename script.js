// -------------------- Local Storage --------------------

// Load saved plants from browser storage
let plants = JSON.parse(localStorage.getItem("plants")) || [];

const form = document.getElementById("plantForm");
const list = document.getElementById("plantList");

// Save data
function savePlants() {
  localStorage.setItem("plants", JSON.stringify(plants));
}

// -------------------- Helpers --------------------

function getDaysSince(date) {
  const now = new Date();
  const past = new Date(date);
  return Math.floor((now - past) / (1000 * 60 * 60 * 24));
}

function getNextWateringDate(lastWatered, frequency) {
  const date = new Date(lastWatered);
  date.setDate(date.getDate() + parseInt(frequency));
  return date;
}

function getStatus(plant) {
  const daysPassed = getDaysSince(plant.lastWatered);
  const remaining = plant.frequency - daysPassed;

  if (remaining < 0) {
    return {
      label: "Overdue",
      subtext: `${Math.abs(remaining)} day(s) overdue`,
      color: "danger",
      remaining,
      needsWater: true
    };
  }

  if (remaining <= 2) {
    return {
      label: "Due Soon",
      subtext: `${remaining} day(s) left`,
      color: "warning",
      remaining,
      needsWater: true
    };
  }

  return {
    label: "Healthy",
    subtext: `${remaining} day(s) left`,
    color: "success",
    remaining,
    needsWater: false
  };
}

// -------------------- Add Plant --------------------

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const frequency = parseInt(document.getElementById("frequency").value);
  const lastWatered = document.getElementById("lastWatered").value;

  addPlant(name, frequency, lastWatered);

  form.reset();
});

function addFromDropdown() {
  const name = document.getElementById("dropdown-name").value;
  const frequency = parseInt(document.getElementById("dropdown-frequency").value);
  const lastWatered = document.getElementById("dropdown-lastWatered").value;

  if (name && frequency && lastWatered) {
    addPlant(name, frequency, lastWatered);

    document.getElementById("dropdown-name").value = "";
    document.getElementById("dropdown-frequency").value = "";
    document.getElementById("dropdown-lastWatered").value = "";
  } else {
    alert("Please fill in all fields.");
  }
}

function addPlant(name, frequency, lastWatered) {
  plants.push({
    name,
    frequency,
    lastWatered,
    history: [lastWatered]
  });

  savePlants();
  render();
}

// -------------------- Render --------------------

function render() {
  list.innerHTML = "";

  if (plants.length === 0) {
    list.innerHTML = `
      <div class="col-12 text-center text-muted">
        <i class="bi bi-droplets" style="font-size:4rem;"></i>
        <h4 class="mt-3">No plants yet</h4>
        <p>Add your first plant above 🌱</p>
      </div>
    `;
    return;
  }

  plants.sort((a, b) => getStatus(a).remaining - getStatus(b).remaining);

  plants.forEach((plant, index) => {
    const status = getStatus(plant);

    const nextDate = getNextWateringDate(
      plant.lastWatered,
      plant.frequency
    );

    const historyHTML = plant.history
      .slice()
      .reverse()
      .map(date => `
        <li>${new Date(date).toLocaleDateString()}</li>
      `)
      .join("");

    const card = document.createElement("div");
    card.className = "col";

    card.innerHTML = `
      <div class="card plant-card shadow-sm h-100">

        <div class="card-body p-4">

          <div class="d-flex justify-content-between align-items-start mb-3">

            <div>
              <div class="mb-2">
                <i class="bi bi-flower1 text-success"></i>
              </div>

              <h4 class="fw-bold mb-1">${plant.name}</h4>

              <div class="text-muted small">
                Water every ${plant.frequency} day(s)
              </div>
            </div>

            <span class="badge bg-${status.color}">
              ${status.label}
            </span>
          </div>

          <div class="mb-3">
            <div class="fw-semibold">
              ${status.subtext}
            </div>

            <div class="text-muted small">
              Next watering:
              ${nextDate.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric"
              })}
            </div>
          </div>

          <hr>

          <h6 class="fw-bold">
            <i class="bi bi-clock-history"></i>
            Watering History
          </h6>

          <ul class="small text-muted ps-3 mb-0">
            ${historyHTML}
          </ul>

        </div>

        <div class="card-footer border-0 px-4 pb-4">

          ${
            status.needsWater
              ? `
              <button
                class="btn btn-success w-100"
                onclick="waterPlant(${index})"
              >
                <i class="bi bi-droplet-fill"></i>
                Mark as Watered
              </button>
            `
              : `
              <button
                class="btn btn-outline-success w-100"
                disabled
              >
                <i class="bi bi-check-circle"></i>
                All Good
              </button>
            `
          }
          <button
          class="btn btn-outline-danger"
          onclick="deletePlant(${index})"
        >
          <i class="bi bi-trash"></i>
          Delete Plant
        </button>
        </div>

      </div>
    `;

    list.appendChild(card);
  });
}

// -------------------- Water Plant --------------------

window.waterPlant = function(index) {
  const today = new Date().toISOString().split("T")[0];

  plants[index].lastWatered = today;

  // Add to history
  plants[index].history.push(today);

  savePlants();
  render();
};
// -------------------- Delete Plant --------------------

window.deletePlant = function(index) {

  const confirmDelete = confirm(
    `Delete ${plants[index].name}?`
  );

  if (confirmDelete) {
    plants.splice(index, 1);

    savePlants();
    render();
  }
};

// -------------------- Initial Render --------------------

render();