const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  send: ipcRenderer.send,
  invoke: ipcRenderer.invoke,
  updateFileName: (oldName, newName) => ipcRenderer.invoke("update-file-name", oldName, newName)
});


document.addEventListener("DOMContentLoaded", () => {
  let myButton = document.getElementById("addButtonId");
  myButton.addEventListener("click", () => {
    let nameInput = document.getElementById("nameInput");
    let name = nameInput.value;
    ipcRenderer.send("createFile", name);
  });

  // Use event delegation to handle clicks on dynamically generated elements
  document.body.addEventListener("click", (event) => {
    if (event.target.classList.contains("fileNameSpan")) {
      let name = event.target.innerText;
      ipcRenderer.send("openFile", name);
    }
  });

  // Call syncPatientsWithFiles when the document is loaded
  ipcRenderer.invoke("syncPatientsWithFiles").then((result) => {
    if (result.success) {
      const fileNames = result.fileNames;
      console.log("sync function called");

      // Retrieve patient array from localStorage
      const patientArray = JSON.parse(localStorage.getItem("patients")) || [];

      // Identify file names that are not in the patient array
      const existingNames = new Set(
        patientArray.map((patient) => patient.name)
      );
      const newPatients = fileNames
        .filter((name) => !existingNames.has(name))
        .map((name) => ({
          name: name,
          age: "",
          location: "",
          disease: "",
          createdAt: new Date().toISOString(), // Add timestamp for new patients
        }));

      // Add new patients to the array
      const updatedPatients = [...patientArray, ...newPatients];
      localStorage.setItem("patients", JSON.stringify(updatedPatients));

      console.log("Sync completed. Updated patients:", updatedPatients);
    } else {
      console.error("Error syncing patients with files:", result.error);
    }
  });
});
