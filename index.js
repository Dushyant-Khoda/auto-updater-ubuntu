const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const log = require("electron-log");

const { autoUpdater } = require("electron-updater");
//Basic flags
const userDataPath = app.getPath("userData");
autoUpdater.autoDownload = true;

autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.autoRunAppAfterInstall = true;
let customPath;
if (process.platform == "win32") {
  customPath = userDataPath.trim() + "\\logs\\main.log";
} else {
  customPath = userDataPath.trim() + "/logs/main.log";
}

log.transports.file.resolvePath = () => path.join(customPath);
console.log(customPath);

log.transports.file.format = `${new Date().toLocaleString()} > {level} : {text}`;

// autoUpdater
let mainWindow;
const createWindow = () => {
  debugger;
  log.info("Application Initialized");
  mainWindow = new BrowserWindow({
    width: 700,
    height: 700,
    fullscreenable: true,
    resizable: false,
    // frame: false,
    movable: true,
    minimizable: true,
    maximizable: false,
    // closable: false,
    // hide app window (for stealth  mode)
    // show: true,
    show: true,
    // disable app icon on windows task bar (for stealth mode)
    skipTaskbar: false,
    webPreferences: {
      allowDisplayingInsecureContent: true,
      webSecurity: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      // preload: path.join(__dirname, 'preload.js'),
      // will break on electron v12
      contextIsolation: false,
      backgroundThrottling: true,
    },
  });
  logger(userDataPath, "/logs/main.log");

  // autoUpdater.checkForUpdates();
  mainWindow.loadFile("view.html");
};
// @info:- Quit when all windows are closed.
app.on("window-all-closed", function () {
  // * On OS X it is common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
    // if (mainWindow && mainWindow.webContents) {
    //     mainWindow.webContents.executeJavaScript(`localStorage.clear()`);
    // }
  }
});

app.on("activate", function () {
  // * On OS X it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

app.whenReady().then(() => {
  // Set the update server URL
  log.info("Application Initialized WhenReady 2.0.0");
  if (process.platform == "linux") {
    autoUpdater.setFeedURL({
      provider: "github",
      repo: "auto-updater-electron",
      owner: "Dushyant-Khoda",
      private: true,
    });
  }

  // Check for updates
  autoUpdater.checkForUpdates();
  autoUpdater.on("update-not-available", (info) => {
    debugger;
    console.log(`No update available. Current version ${app.getVersion()}`);
    log.info(`No update available. Current version ${app.getVersion()}`);
    log.info("line:71 " + JSON.stringify(info));
  });

  // Handle the update-available event
  autoUpdater.on("update-available", (info) => {
    debugger;
    log.info("update-available" + JSON.stringify(info));
    dialog
      .showMessageBox({
        type: "info",
        title: "Update available",
        message:
          "A new version of the app is available. Do you want to download it?",
        buttons: ["Yes", "No"],
        defaultId: 0,
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.downloadUpdate();
        } else {
          autoUpdater.downloadUpdate();
        }
      });
  });

  // Handle the update-downloaded event
  autoUpdater.on("update-downloaded", (info) => {
    debugger;
    log.info("update-Downloaded" + JSON.stringify(info));
    dialog
      .showMessageBox({
        type: "info",
        title: "Update downloaded",
        message: "A new version has been downloaded. Quit and install now?",
        buttons: ["Yes", "No"],
        defaultId: 0,
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  autoUpdater.on("download-progress", (progressObj) => {
    debugger;
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + " - Downloaded " + progressObj.percent + "%";
    log_message =
      log_message +
      " (" +
      progressObj.transferred +
      "/" +
      progressObj.total +
      ")";
    log.info(log_message);
  });

  autoUpdater.on("error", (info) => {
    debugger;
    console.log(info);
    log.info(JSON.stringify(info));
  });
  log.info("Application Initialized WhenReady End 1.8.0");
});

// autoUpdater.on("update-available", (info) => {
//   console.log(`Update available. Current version ${app.getVersion()}`);
//   log.info(`Update available. Current version ${app.getVersion()}`);
//   log.info("line:65 " + JSON.stringify(info));
//   autoUpdater.downloadUpdate();
// });

// autoUpdater.on("update-not-available", (info) => {
//   console.log(`No update available. Current version ${app.getVersion()}`);
//   log.info(`No update available. Current version ${app.getVersion()}`);
//   log.info("line:71 " + JSON.stringify(info));
// });

// /*Download Completion Message*/
// autoUpdater.on("update-downloaded", (info) => {
//   console.log(`Update downloaded. Current version ${app.getVersion()}`);
//   log.info(`Update downloaded. Current version ${app.getVersion()}`);
//   log.info("line:77 " + JSON.stringify(info));
//   autoUpdater.quitAndInstall();
// });

// app.whenReady().then(() => {
//   autoUpdater.checkForUpdatesAndNotify();
// });

function logger(s) {
  console.log("Logger", s);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.executeJavaScript(`console.log("${s}")`);
  }
}

app.on("ready", () => {
  createWindow();
});
