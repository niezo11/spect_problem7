let plants = [];

const form = document.getElementById("plantForm");
const list = document.getElementById("plantList");

// --- Helper Functions ---

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
    return { label: `Overdue`, subtext: `${Math.abs(remaining)} day(s) late`, color: "danger", remaining };
  } else if (remaining <= 2) {
    return { label: `Due Soon`, subtext: `${remaining} day(s) left`, color: "warning", remaining };
  } else {
    return { label: `Healthy`, subtext: `${remaining} day(s) left`, color: "success", remaining };
  }
}

// --- Event Handlers ---

// Main Form Submission
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const frequency = parseInt(document.getElementById("frequency").value);
  const lastWatered = document.getElementById("lastWatered").value;

  addPlant(name, frequency, lastWatered);
  form.reset();
});

// Dropdown Form Submission
function addFromDropdown() {
  const name = document.getElementById("dropdown-name").value;
  const frequency = document.getElementById("dropdown-frequency").value;
  const lastWatered = document.getElementById("dropdown-lastWatered").value;

  if (name && frequency && lastWatered) {
    addPlant(name, frequency, lastWatered);
    // Clear dropdown inputs
    document.getElementById("dropdown-name").value = "";
    document.getElementById("dropdown-frequency").value = "";
    document.getElementById("dropdown-lastWatered").value = "";
  } else {
    alert("Please fill in all fields");
  }
}

function addPlant(name, frequency, lastWatered) {
  plants.push({ name, frequency, lastWatered });
  render();
}

// --- Render Function ---

function render() {
  list.innerHTML = "";

  if (plants.length === 0) {
    list.innerHTML = `
      <div class="col-12 text-center text-muted">
        <i class="bi bi-droplets" style="font-size: 3rem;"></i>
        <p>No plants tracked yet. Add one above!</p>
      </div>`;
    return;
  }

  // Sort by urgency
  plants.sort((a, b) => getStatus(a).remaining - getStatus(b).remaining);

  plants.forEach((plant, index) => {
    const status = getStatus(plant);
    const nextDate = getNextWateringDate(plant.lastWatered, plant.frequency);

    const cardCol = document.createElement("div");
    cardCol.className = "col";
    
    cardCol.innerHTML = `
      <div class="card plant-card h-100 shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="card-title fw-bold mb-0">${plant.name}</h5>
            <span class="badge bg-${status.color}">${status.label}</span>
          </div>
          <p class="text-muted small mb-3">Water every ${plant.frequency} days</p>
          
          <div class="p-2 rounded bg-light border-start border-${status.color} border-4">
            <div class="small fw-bold">${status.subtext}</div>
            <div class="text-muted extra-small" style="font-size: 0.75rem;">
              Next: ${nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
        <div class="card-footer bg-transparent border-0 pb-3">
          <button class="btn btn-sm btn-success w-100" onclick="waterPlant(${index})">
            <i class="bi bi-check2-circle"></i> Mark as Watered
          </button>
        </div>
      </div>
    `;

    list.appendChild(cardCol);
  });
}

// Updated waterPlant function using index
window.waterPlant = function(index) {
  plants[index].lastWatered = new Date().toISOString().split("T")[0];
  render();
};

// Initial render
render();