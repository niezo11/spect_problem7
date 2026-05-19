let plants = [];

const form = document.getElementById("plantForm");
const list = document.getElementById("plantList");

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
      className: "status-danger",
      remaining,
      needsWater: true
    };
  }

  if (remaining <= 2) {
    return {
      label: "Due Soon",
      subtext: `${remaining} day(s) left`,
      color: "warning",
      className: "status-warning",
      remaining,
      needsWater: true
    };
  }

  return {
    label: "Healthy",
    subtext: `${remaining} day(s) left`,
    color: "success",
    className: "status-healthy",
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
  plants.push({ name, frequency, lastWatered });
  render();
}

// -------------------- Render --------------------

function render() {
  list.innerHTML = "";

  if (plants.length === 0) {
    list.innerHTML = `
      <div class="col-12 text-center text-muted empty-state">
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

    const card = document.createElement("div");
    card.className = "col";

    card.innerHTML = `
      <div class="card plant-card shadow-sm h-100">
        
        <div class="card-body p-4">

          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <div class="plant-icon mb-2">
                <i class="bi bi-flower1"></i>
              </div>

              <h4 class="fw-bold mb-1">${plant.name}</h4>

              <div class="text-muted small">
                Water every ${plant.frequency} day(s)
              </div>
            </div>

            <span class="badge bg-${status.color} px-3 py-2">
              ${status.label}
            </span>
          </div>

          <div class="status-box ${status.className}">
            <div class="fw-semibold">
              ${status.subtext}
            </div>

            <div class="text-muted next-date">
              Next watering:
              ${nextDate.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric"
              })}
            </div>
          </div>

        </div>

        <div class="card-footer border-0 px-4 pb-4">

          ${
            status.needsWater
              ? `
            <button
              class="btn btn-success btn-water w-100"
              onclick="waterPlant(${index})"
            >
              <i class="bi bi-droplet-fill"></i>
              Mark as Watered
            </button>
          `
              : `
            <button
              class="btn btn-outline-success btn-water w-100"
              disabled
            >
              <i class="bi bi-check-circle"></i>
              All Good
            </button>
          `
          }

        </div>

      </div>
    `;

    list.appendChild(card);
  });
}

// -------------------- Water Plant --------------------

window.waterPlant = function(index) {
  plants[index].lastWatered =
    new Date().toISOString().split("T")[0];

  render();
};

// -------------------- Initial Render --------------------

render();