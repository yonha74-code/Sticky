
const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let dashboardWindow = null;
const noteWindows = new Map();

// 메인 컨트롤러 창 생성
function createDashboard() {
  dashboardWindow = new BrowserWindow({
    width: 350,
    height: 600,
    title: "Pastel Dashboard",
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // 단순화를 위해 nodeIntegration 사용
      webSecurity: false
    }
  });

  dashboardWindow.loadFile('index.html'); // 모드 없이 로드하면 대시보드
  dashboardWindow.setMenuBarVisibility(false);
  
  dashboardWindow.on('closed', () => {
    // 대시보드가 닫히면 모든 포스트잇도 종료
    app.quit();
  });
}

// 개별 포스트잇 창 생성
function createNoteWindow(noteId, position = null) {
  if (noteWindows.has(noteId)) {
    noteWindows.get(noteId).focus();
    return;
  }

  const { width, height } = { width: 300, height: 350 };
  
  const win = new BrowserWindow({
    width,
    height,
    x: position ? position.x : undefined,
    y: position ? position.y : undefined,
    frame: false, // 상단 바 제거
    transparent: true, // 배경 투명화
    alwaysOnTop: false,
    skipTaskbar: true, // 작업표시줄에 개별 노출 안 함 (깔끔하게)
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  // noteId를 해시로 전달하여 index.html이 특정 노드임을 인식하게 함
  win.loadFile('index.html', { hash: `note-${noteId}` });
  
  noteWindows.set(noteId, win);

  win.on('closed', () => {
    noteWindows.delete(noteId);
  });
}

// IPC 통신 설정
ipcMain.on('spawn-note', (event, { id, position }) => {
  createNoteWindow(id, position);
});

ipcMain.on('close-note', (event, id) => {
  const win = noteWindows.get(id);
  if (win) win.close();
});

ipcMain.on('refresh-all', () => {
  // 모든 창에 데이터 변경 알림 (필요 시)
  dashboardWindow.webContents.send('sync-data');
  noteWindows.forEach(win => win.webContents.send('sync-data'));
});

app.whenReady().then(() => {
  createDashboard();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createDashboard();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
