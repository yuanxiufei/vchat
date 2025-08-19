import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
// 引入千帆大模型的的api
import { ChatCompletion } from "@baiducloud/qianfan";
//  引入doenv自动加载env文件
import 'dotenv/config'
// 引入openAI
import OpenAI from 'openai';
// 引入fs模块
import fs from 'fs/promises'
// 引入完整的fs模块
import fs1 from 'fs';
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = async () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  /**
   * 初始化千帆大模型的api
   */
  // 通过参数初始化，设置安全认证ACCESS_KEY/SECRET_KEY
  // const client = new ChatCompletion({ 
  //   QIANFAN_ACCESS_KEY: process.env.QIANFAN_ACCESS_KEY, 
  //   QIANFAN_SECRET_KEY: process.env.QIANFAN_SECRET_KEY,
  //   ENABLE_OAUTH: true // 启用OAuth认证
  // });
  //   try {
  //     const stream = await client.chat({
  //       messages: [
  //         {
  //           role: "user",
  //           content: "光合作用有什么作用？"
  //         }
  //       ],
  //       stream: true
  //     }, "ERNIE-Speed-128K");
  //     for await (const chunk of stream as AsyncIterable<any>) {
  //       console.log('chunk', chunk);
  //     }
  //   } catch (error) {
  //     console.error('API 调用失败:', error);
  //   }

  /**
   * 初始化openAI的api
   */
  const client = new OpenAI({
    apiKey: process.env.ALI_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
  });
  // const stream = await client.chat.completions.create({
  //   model: "qwen-turbo",
  //   messages: [
  //     {
  //       role: "system",
  //       content: "你好,你是一个六岁的男孩哦"
  //     }
  //   ],
  //   stream: true
  // });
  // for await (const chunk of stream as AsyncIterable<any>) {
  //   console.log('chunk', chunk.choices[0].delta);
  // }
  // const resp = await client.chat.completions.create({
  //   model: "qwen-turbo",
  //   messages: [
  //     {
  //       role: "system",
  //       content: "你好,你是一个六岁的男孩哦"
  //     }
  //   ]
  // });
  // console.log('resp', resp.choices[0].message.content);
  // // 写入文件以排查编码问题
  // const outputDir = path.join(__dirname, '../data');
  // if (!fs1.existsSync(outputDir)) fs1.mkdirSync(outputDir, { recursive: true });
  // const outputPath = path.join(outputDir, 'output.txt');
  // console.log('写入绝对路径:', outputPath);
  // try {
  //   fs1.writeFileSync(outputPath, resp.choices[0].message.content, { encoding: 'utf8' });
  //   console.log('写入成功');
  // } catch (e) {
  //   console.error('写入文件异常:', e);
  // }
  // 读取图片时，始终用 path.resolve(app.getAppPath(), 'src/data/dog.jpg')
  // const imagePath = path.resolve(app.getAppPath(), 'src/data/dog.jpg');
  // const imageBuffer = await fs1.readFile(imagePath);
  // const base64Image = imageBuffer.toString('base64');
  // const resp = await client.chat.completions.create({
  //   model: "qwen-vl-plus",
  //   messages: [
  //     {
  //       role: "user",
  //       content: [
  //         {
  //           type: "text",
  //           text: "图中是什么动物"
  //         },
  //         {
  //           type: "image_url",
  //           image_url: {
  //             url: `data:image/jpeg;base64,${base64Image}`,
  //             detail: "high"
  //           }
  //         }
  //       ]
  //     }
  //   ]
  // });
  // console.log('resp', resp);
  // const outputDir = path.join(__dirname, '../data');
  // if (!fs1.existsSync(outputDir)) fs1.mkdirSync(outputDir, { recursive: true });
  // const outputPath = path.join(outputDir, 'output.txt');
  // console.log('写入绝对路径:', outputPath);
  // try {
  //   fs1.writeFileSync(outputPath, resp.choices[0].message.content, { encoding: 'utf8' });
  //   console.log('写入成功');
  // } catch (e) {
  //   console.error('写入文件异常:', e);
  // }
  const pdfPath = path.resolve(app.getAppPath(), 'src/data/1.pdf');
  const fileObj = await client.files.create({ file: fs1.createReadStream(pdfPath), purpose: 'file-extract' as any });
  console.log('fileObj', fileObj)
  const resp = await client.chat.completions.create({
    model: "qwen-long",
    messages: [
      {
        "role": "system",
        "content": "You are a helpful assistant.",
      },
      { "role": "system", "content": `fileid://${fileObj.id}` },
      {
        "role": "user",
        "content": "请帮忙概括文件讲述了什么"
      }
    ]
  })
  console.log('resp', resp.choices[0].message);
  const outputDir = path.join(__dirname, '../data');
  if (!fs1.existsSync(outputDir)) fs1.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'output.txt');
  console.log('写入绝对路径:', outputPath);
  try {
    fs1.writeFileSync(outputPath, resp.choices[0].message.content, { encoding: 'utf8' });
    console.log('写入成功');
  } catch (e) {
    console.error('写入文件异常:', e);
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
