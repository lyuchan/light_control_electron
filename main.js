const portPath = 'COM8'
const { SerialPort } = require('serialport');
const globalShortcut = require('electron').globalShortcut
const serialport = new SerialPort({ path: portPath, baudRate: 115200 })
const { Tray, Menu, app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
let wins
let wval = 0
let yval = 0
function createTray(win) {
    const iconPath = path.join(__dirname, '/img/idea.png');
    const tray = new Tray(iconPath)
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '回復',
            click: () => win.show()
        },
        {
            label: '結束',
            click: () => {
                app.isQuiting = true;
                app.quit();
            }
        }
    ])
    tray.setToolTip('Tally Light Control')
    tray.setContextMenu(contextMenu);
    tray.on('click', () => win.show())
    return tray;
}
const createWindow = () => {
    const win = new BrowserWindow({
        width: 350,
        height: 350,
        title: "燈光控制",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    win.setMenu(null)
    win.loadFile('index.html')
    return win;
}
app.whenReady().then(() => {
    wins = createWindow()
    createTray(wins);
    globalShortcut.register(`CommandOrControl+Alt+numadd`, () => {
        if (wval < 255 && wval % 15 == 0) {
            wval+=15;
            serialport.write(`{"pwmw":${wval},"pwmy":${yval}}\r\n`)
        }
    })
    globalShortcut.register(`CommandOrControl+Alt+numsub`, () => {
        if (wval > 0 && wval % 15 == 0) {
            wval-=15;
            serialport.write(`{"pwmw":${wval},"pwmy":${yval}}\r\n`)
        }
    })
    globalShortcut.register(`CommandOrControl+Alt+Shift+numadd`, () => {
        if (yval < 255 && yval % 15 == 0) {
            yval+=15;
            serialport.write(`{"pwmw":${wval},"pwmy":${yval}}\r\n`)
        }
    })
    globalShortcut.register(`CommandOrControl+Alt+Shift+numsub`, () => {
        if (yval > 0 && yval % 15 == 0) {
            yval-=15;
            serialport.write(`{"pwmw":${wval},"pwmy":${yval}}\r\n`)
        }
    })
    globalShortcut.register(`CommandOrControl+Alt+Shift+nummult`, () => {
        wval = 255;
        yval = 255;
        serialport.write(`{"pwmw":${wval},"pwmy":${yval}}\r\n`)

    })
    globalShortcut.register(`CommandOrControl+Alt+Shift+numdiv`, () => {
        wval = 0;
        yval = 0;
        serialport.write(`{"pwmw":${wval},"pwmy":${yval}}\r\n`)

    })
})
app.on('window-all-closed', () => app.quit())
ipcMain.on("toMain", (event, args) => {
    //tomain
    let res = JSON.parse(args);
    console.log(res)
    if (res.get == 'clickhide') {
        wins.hide();
    }
    if (res.get == 'updatew') {
        wval = res.val;
    }
    if (res.get == 'updatey') {
        yval = res.val;
    }
    serialport.write(`{"pwmw":${wval},"pwmy":${yval}}\r\n`)
});