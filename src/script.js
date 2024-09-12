let patients = JSON.parse(localStorage.getItem("patients")) || []; // Retrieve data from local storage or initialize empty array
const form = document.getElementById("addPatientForm");
const searchForm = document.getElementById("searchForm");
const patientList = document.getElementById("patientList");
const modalForm = document.getElementById("modalForm");
const modalBackdrop = document.getElementById("modalBackdrop");

// Show modal form
document.getElementById("openFormBtn").addEventListener("click", () => {
  modalForm.classList.remove("hidden");
  modalBackdrop.classList.remove("hidden");
});

// Close modal form
document.getElementById("closeFormBtn").addEventListener("click", () => {
  modalForm.classList.add("hidden");
  modalBackdrop.classList.add("hidden");
});

// Add new patient
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nameInput = document.getElementById("nameInput").value;
  const ageInput = parseInt(document.getElementById("ageInput").value, 10);
  const locationInput = document.getElementById("locationInput").value;
  const diseaseInput = document.getElementById("diseaseInput").value;

  // Check if the name already exists in the patients array
  const nameExists = patients.some(patient => patient.name === nameInput);

  if (nameExists) {
    alert("Error: Patient with this name already exists.");
    return;
  }

  const newPatient = {
    name: nameInput,
    age: ageInput,
    location: locationInput,
    disease: diseaseInput,
    createdAt: new Date().toISOString(), // Add timestamp
  };

  patients.push(newPatient);
  localStorage.setItem("patients", JSON.stringify(patients)); // Save data to local storage
  displayPatients(patients);

  // Reset form
  form.reset();
  modalForm.classList.add("hidden");
  modalBackdrop.classList.add("hidden");
});


// Search patients
document.getElementById("searchInput").addEventListener("input", () => {
  const searchValue = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchValue)
  );
  displayPatients(filteredPatients);
});

function displayPatients(patients) {
  patientList.innerHTML = "";

  // Sort patients by createdAt in descending order (latest first)
  patients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (patients.length === 0) {
    patientList.innerHTML = `<div class="no-data-container"><span>No data found!</span></div>`;
  } else {
    patients.forEach((patient, index) => {
      const patientDiv = document.createElement("div");
      patientDiv.classList.add(
        "patient-card"
      );
      patientDiv.innerHTML = `
        <span class="patient-name fileNameSpan" data-index="${index}">${patient.name}</span>
        <div id="patientCard" class="patient-actions">
          <button class="btn detail-btn" onclick="viewDetail(${index})">Detail</button>
          <button class="btn edit-btn" onclick="editPatient(${index})">Edit</button>
          <button class="btn delete-btn" onclick="deleteEntry(${index})">Delete</button>
        </div>`;
      patientList.appendChild(patientDiv);
    });
  }
}

window.viewDetail = function (index) {
  const patient = patients[index];

  // Populate the modal with patient details
  document.getElementById("modalTitle").innerText = `Details for ${patient.name}`;
  document.getElementById("modalContent").innerHTML = `
    <strong>Age:</strong> ${patient.age}<br>
    <strong>Location:</strong> ${patient.location}<br>
    <strong>Disease:</strong> ${patient.disease}
  `;

  // Show the modal
  document.getElementById("detailsModal").classList.remove("hidden");
};

// Function to close the modal
function closeModal() {
  document.getElementById("detailsModal").classList.add("hidden");
}

// Function to handle the edit action
window.editPatient = function (index) {
  const patient = patients[index];

  // Populate the edit modal with the current patient details
  document.getElementById("editName").value = patient.name;
  document.getElementById("editAge").value = patient.age;
  document.getElementById("editLocation").value = patient.location;
  document.getElementById("editDisease").value = patient.disease;

  // Show the edit modal
  document.getElementById("editModal").classList.remove("hidden");

  // Save index for reference when saving changes
  window.editingIndex = index;
};

// Save changes after editing
window.saveChanges = function () {
  const index = window.editingIndex;

  // Store the original name before making any changes
  const oldName = patients[index].name;

  // Create the updated patient object
  const updatedPatient = {
    name: document.getElementById("editName").value,
    age: document.getElementById("editAge").value,
    location: document.getElementById("editLocation").value,
    disease: document.getElementById("editDisease").value,
  };

  // Update the patient array with the new information
  patients[index] = updatedPatient;
  localStorage.setItem("patients", JSON.stringify(patients));

  const newName = updatedPatient.name;

  // Now compare the oldName with newName
  if (oldName !== newName) {
    console.log(`Attempting to update file name from ${oldName} to ${newName}`);
    
    window.electronAPI.updateFileName(oldName, newName)
      .then(result => {
        console.log('Update result:', result);
        if (result.success) {
          displayPatients(patients);
          closeEditModal();
        } else {
          alert('Failed to update file name.');
        }
      })
      .catch(error => {
        console.error('Error updating file name:', error);
        alert('Failed to update file name.');
      });
  } else {
    displayPatients(patients);
    closeEditModal();
  }
};


// Close the edit modal
function closeEditModal() {
  document.getElementById("editModal").classList.add("hidden");
}

// Delete patient
window.deleteEntry = function (index) {
  const patient = patients[index];

  // Confirm deletion
  if (
    confirm(`Are you sure you want to delete the entry for ${patient.name}?`)
  ) {
    // Remove the patient from the array
    patients.splice(index, 1);

    // Save the updated data to localStorage
    localStorage.setItem("patients", JSON.stringify(patients));

    // Notify the main process to delete the file
    ipcRenderer.send("deleteFile", patient.name);

    // Re-render the patient list
    displayPatients(patients);
  }
};

// Initial display
displayPatients(patients);
