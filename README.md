# DocAssist App

**DocAssist** is an Electron-based desktop application designed to help users manage patient records. The app allows users to add, search, and update notes for individual patients. It also supports features like file creation, renaming, local file synchronization, and cloud sync capabilities.

## Features

- **Add New Patients**: Allows users to create new `.doc` files for patient records.
- **Search and Filter**: Users can search for patients by name.
- **File Management**: Users can rename, delete, and update patient records. Files are stored locally in the `Documents/PatientRecords` folder.
- **Sync with Local Files**: The app checks for any files in the specified directory that are not yet added to the application’s list and allows users to sync them.
- **Rich Text Editor**: Provides rich text editing capabilities for adding or updating patient details.
- **Custom Fields**: Users can add custom fields to patient records.
- **Cloud Sync**: Syncs patient records to the cloud (future feature).

## Technologies Used

- **Electron**: Provides the desktop app framework.
- **React**: The front-end framework for building the UI.
- **Tailwind CSS**: Used for styling the application.
- **Node.js**: Handles file system operations and back-end logic.
- **JavaScript (ES6+)**: Main language used for front-end and back-end logic.
- **Webpack**: Module bundler to manage and build assets.

## Folder Structure

```bash
.
├── /src
│   ├── /components           # React components
│   ├── /preload.js           # Handles IPC communication between Electron main and renderer processes
│   ├── /index.js             # Main Electron entry point
│   ├── /app                  # React application folder
│   ├── /assets               # Static files and images
├── /build                    # Build folder for the Electron app
├── /public                   # Public folder for static files
├── package.json              # Node.js dependencies and scripts
├── tailwind.config.js         # Tailwind CSS configuration
└── README.md                 # Project documentation
```

## Getting Started

### Prerequisites

- **Node.js** (v14 or later)
- **npm** or **yarn**

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/doc-assist.git
   ```

2. Navigate to the project directory:

   ```bash
   cd doc-assist
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

### Running the App in Development

To run the app in development mode:

```bash
npm run start
```

This will start the Electron app along with the React front-end in development mode.

### Building the App for Production

To package the app for production:

```bash
npm run make
```

This will create an executable file in the `/out` folder for your operating system.

### Syncing Files with Local Directory

The app automatically checks the `Documents/PatientRecords` directory for new files. If a file is found that is not already added to the application, a sync button will appear to allow users to add it to the patient list.

## IPC Communication

The application uses Electron's IPC communication between the main process and the renderer process for the following actions:

- **createFile**: Creates a new patient record file.
- **openFile**: Opens a patient file.
- **update-file-name**: Renames a patient record file.
- **syncPatientsWithFiles**: Syncs the app’s patient list with the local directory.

### Preload Script

The `preload.js` file handles the communication between the front-end and back-end via the `contextBridge` API. It exposes methods such as `send`, `invoke`, and `updateFileName` to facilitate this communication securely.

## Key Code Snippets

### Renaming a File

This is how the app renames a file when a patient's name is updated:

```javascript
ipcMain.handle("update-file-name", async (event, oldName, newName) => {
  const oldFilePath = path.join(getPatientRecordsPath(), `${oldName}.doc`);
  const newFilePath = path.join(getPatientRecordsPath(), `${newName}.doc`);
  
  if (!fs.existsSync(oldFilePath)) {
    return { success: false, error: `File not found: ${oldFilePath}` };
  }

  try {
    await fs.promises.rename(oldFilePath, newFilePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

## Known Issues

- **File Path Issues**: Ensure that file names are unique and do not contain invalid characters, as this may cause issues with file renaming or creation.
- **Cloud Sync Feature**: Still under development and may not be available in the current build.

## Future Improvements

- Add a cloud sync feature for patient records.
- Enhance the rich text editor with more formatting options.
- Add error handling and notifications for all major user actions.

## License

This project is licensed under the MIT License.

---

## Contact

For any issues or suggestions, feel free to contact:

**Muhammad Ahmad**

