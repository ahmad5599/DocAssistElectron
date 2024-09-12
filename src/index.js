const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("node:path");
const fs = require("fs").promises; // Use promises for async/await

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false, // Disable Node integration in the renderer
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Define the directory path dynamically
const getPatientRecordsPath = () => {
  const documentsPath = app.getPath("documents");
  const patientRecordsPath = path.join(documentsPath, "PatientRecords");
  return patientRecordsPath;
};

ipcMain.handle("syncPatientsWithFiles", async () => {
  const dirPath = getPatientRecordsPath();
  try {
    // Ensure the directory exists
    await fs
      .access(dirPath)
      .catch(() => fs.mkdir(dirPath, { recursive: true }));

    // Read all file names from the directory
    const files = await fs.readdir(dirPath);
    const fileNames = files.map((file) => path.parse(file).name); // Extract file names without extension
    return { success: true, fileNames };
  } catch (error) {
    console.error("Error reading files:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.on("createFile", async (event, name) => {
  const filePath = path.join(getPatientRecordsPath(), `${name}.doc`);

  // Check if the name is empty
  if (!name || name.trim() === "") {
    console.error("Error: Name cannot be empty.");
    event.reply("fileCreationResult", { success: false, message: "Name cannot be empty." });
    return;
  }

  try {
    // Check if the file already exists
    await fs.access(filePath);
    console.error("Error: File already exists.");
    event.reply("fileCreationResult", { success: false, message: "File already exists." });
  } catch (err) {
    if (err.code === 'ENOENT') {
      // File does not exist, proceed to create it
      try {
        await fs.writeFile(filePath, name.toString());
        console.log("File created successfully!");
        event.reply("fileCreationResult", { success: true, message: "File created successfully!" });
      } catch (writeErr) {
        console.error("Error creating file:", writeErr);
        event.reply("fileCreationResult", { success: false, message: "Error creating file." });
      }
    } else {
      console.error("Error checking file existence:", err);
      event.reply("fileCreationResult", { success: false, message: "Error checking file existence." });
    }
  }
});

ipcMain.on("openFile", (event, name) => {
  const filePath = path.join(getPatientRecordsPath(), `${name}.doc`);
  shell
    .openPath(filePath, "r+")
    .then(() => {
      console.log("File opened successfully!");
    })
    .catch((err) => {
      console.error("Error opening file:", err);
    });
});

ipcMain.on("deleteFile", async (event, name) => {
  const filePath = path.join(getPatientRecordsPath(), `${name}.doc`);
  try {
    await fs.unlink(filePath);
    console.log(`File ${filePath} deleted successfully!`);
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
});

ipcMain.handle("update-file-name", async (event, oldName, newName) => {

  const oldFilePath = path.join(getPatientRecordsPath(), `${oldName}.doc`);
  const newFilePath = path.join(getPatientRecordsPath(), `${newName}.doc`);
  try {
    await fs.rename(oldFilePath, newFilePath);
    console.log(`File renamed from ${oldName} to ${newName}`);
    return { success: true };
  } catch (error) {
    console.error(`Error renaming file from ${oldName} to ${newName}:`, error);
    return { success: false, error: error.message };
  }
});


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
