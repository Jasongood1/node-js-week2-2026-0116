const http = require('node:http');
const fs = require('node:fs');
const { formidable } = require('formidable');  // formidable v3 用 named import

// ========== 任務一：讀取上傳設定 ==========
/**
 * 從 process.env 讀取上傳相關設定，回傳設定物件。
 *
 * 規則：
 *   - UPLOAD_DIR 未設定 → 預設 '/tmp'
 *   - MAX_FILE_SIZE_MB 未設定 → 預設 5（MB）
 *   - GYM_NAME 未設定 → 預設 '未命名健身房'
 *
 * 回傳物件：
 *   - uploadDir: 上傳目錄（字串）
 *   - maxFileSize: 最大檔案大小（bytes，= MB * 1024 * 1024）
 *   - gymName: 健身房名稱（字串）
 *
 * @returns {{uploadDir: string, maxFileSize: number, gymName: string}}
 *
 * @example
 *   process.env.UPLOAD_DIR = '/tmp/uploads';
 *   process.env.MAX_FILE_SIZE_MB = '10';
 *   process.env.GYM_NAME = 'FitClub';
 *   getUploadConfig();
 *   // { uploadDir: '/tmp/uploads', maxFileSize: 10485760, gymName: 'FitClub' }
 */
function getUploadConfig() {
  // TODO: 實作此函式
  // 提示：用 || 給預設值；MAX_FILE_SIZE_MB 是字串，記得先 Number() 轉型再換算 bytes
  const uploadDir = process.env.UPLOAD_DIR || '/tmp';
  const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 5);
  const gymName = process.env.GYM_NAME || '未命名健身房';

  return {
    uploadDir,
    maxFileSize: maxFileSizeMb * 1024 * 1024,
    gymName
  };
}
// const result = getUploadConfig();
// console.log(result);

// ========== 任務二：取副檔名 ==========
/**
 * 從檔名取副檔名，一律回小寫帶 `.`。
 *
 * 規則：
 *   - 'cat.jpg' → '.jpg'
 *   - 'PHOTO.JPG' → '.jpg'（一律小寫）
 *   - 'README' → ''（沒有副檔名）
 *   - 'archive.tar.gz' → '.gz'（只取最後一個）
 *
 * @param {string} filename
 * @returns {string}
 *
 * @example
 *   getFileExtension('cat.jpg');     // '.jpg'
 *   getFileExtension('PHOTO.JPG');   // '.jpg'
 *   getFileExtension('README');      // ''
 */
function getFileExtension(filename) {
  // TODO: 實作此函式
  // 提示：用 lastIndexOf('.') 找最後一個 .，toLowerCase() 轉小寫  //檔名只有一個點 indexOf('.')
  // 1. 找出最後一點索引位置
  const lastDotIndexOf = filename.lastIndexOf('.'); // 檔名會有好幾個點用 lastIndexOf('.') 找出多點中最後一個點
  console.log(lastDotIndexOf)
  // 2. 檢查有無副檔名  lastDotIndex === -1：代表找不到點號（例如 'README'）  lastDotIndex === 0 代表點號在最前面 .gitignore），這通常算檔名而不是副檔名
  if (lastDotIndexOf === -1 || lastDotIndexOf === 0) {
    return '';
  }
  // 3.切出附檔名與轉成小寫
  return filename.slice(lastDotIndexOf).toLowerCase();
}
//console.log(getFileExtension('cat.jpg'));


// ========== 任務三：解析檔案 metadata ==========
/**
 * 吃 formidable 解析後的 file 物件，回傳整理好的 metadata。
 *
 * formidable 的 file 物件至少有：
 *   - originalFilename: 原始檔名
 *   - size: 檔案 byte 數
 *
 * 回傳：
 *   - filename: 原始檔名
 *   - sizeKB: 檔案大小換成 KB（四捨五入，用 Math.round）
 *   - ext: 副檔名（用任務二的 getFileExtension）
 *
 * @param {{originalFilename: string, size: number}} file
 * @returns {{filename: string, sizeKB: number, ext: string}}
 *
 * @example
 *   parseFileMetadata({ originalFilename: 'leo.jpg', size: 250000 });
 *   // { filename: 'leo.jpg', sizeKB: 244, ext: '.jpg' }
 */
function parseFileMetadata(file) {
  // TODO: 實作此函式
  // 提示：呼叫 getFileExtension 取副檔名，Math.round(size / 1024) 算 KB
  // 1. 取得原始檔名
  const filename = file.originalFilename;

  // 2. 計算 KB：將 byte 數除以 1024，並用 Math.round()  1KB = 1024bytes
  const sizeKB = Math.round(file.size / 1024);

  // 3. 呼叫任務二的函式來取得副檔名
  const ext = getFileExtension(filename);

  // 4. 物件回傳
  return {
    filename: filename, // 也可以簡寫成 filename
    sizeKB: sizeKB,     // 也可以簡寫成 sizeKB
    ext: ext,           // 也可以簡寫成 ext
  };
}
// const result = parseFileMetadata({ originalFilename: 'leo.jpg', size: 250000 });
// console.log(result);


// ========== 任務四：產出 upload log 字串 ==========
/**
 * 吃 metadata + config，產出一行 log 字串。
 *
 * 格式：`[{gymName}] Uploaded {filename} ({sizeKB} KB) → {uploadDir}`
 *
 * @param {{filename: string, sizeKB: number}} meta
 * @param {{uploadDir: string, gymName: string}} config
 * @returns {string}
 *
 * @example
 *   formatUploadLog(
 *     { filename: 'leo.jpg', sizeKB: 245, ext: '.jpg' },
 *     { uploadDir: '/tmp/uploads', gymName: 'FitClub' }
 *   );
 *   // '[FitClub] Uploaded leo.jpg (245 KB) → /tmp/uploads'
 */
function formatUploadLog(meta, config) {
  // TODO: 實作此函式
  // 提示：用 template literal 組字串

  // 1. 解構（Destructuring）取出我們需要的屬性值，讓程式碼更簡潔
  //物件解構賦值」是 JavaScript ES6 引入的語法糖
  const { filename, sizeKB } = meta; // 如同 取得meta中filename, sizeKB之屬性值
  const { gymName, uploadDir } = config;

  // 2. 使用樣板字面值（Template Literal）組合成目標格式
  return `[${gymName}] Uploaded ${filename} (${sizeKB} KB) → ${uploadDir}`
}
/* 
const log = formatUploadLog(
  { filename: 'leo.jpg', sizeKB: 245, ext: '.jpg' },
  { uploadDir: '/tmp/uploads', gymName: 'FitClub' }
);

console.log(log); 
*/

// ========== 任務五：路由分派 ==========
/**
 * 吃 HTTP request / response / config，依 method + url 分派到對應處理邏輯。
 *
 * 規格：
 *   - POST /coaches/avatar：
 *     * 用 formidable 解析 multipart/form-data
 *     * 成功 → 回 200 + JSON { filename, sizeKB, ext, savedPath }
 *     * formidable 解析錯誤（含超過 maxFileSize）→ 回 500 + JSON { error }
 *     * 沒 file 欄位 → 回 400 + JSON { error: 'No file uploaded' }
 *   - 其他路徑 → 回 404 + JSON { error: 'Not Found' }
 *
 * formidable 設定：
 *   - uploadDir / maxFileSize 從 config 取
 *   - keepExtensions: true
 *
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {{uploadDir: string, maxFileSize: number, gymName: string}} config
 * @returns {void} 直接操作 res 回寫、不 return 值
 *
 * @example
 *   // 在 createUploadServer 裡：
 *   http.createServer((req, res) => router(req, res, config))
 */
function router(req, res, config) {
  // TODO: 實作此函式
  // 建議（非強制）：
  //   - 拆出 handleUpload(req, res, config)：formidable 解析邏輯
  //   - 拆出 handleNotFound(req, res)：404 邏輯
  //   - router 只看 method + url、呼叫對應 handler
  // formidable 錯誤處理要點：
  //   - 錯誤解析（例如：maxFileSize）會進到 form.parse 的 callback err，因此錯誤回應（res）可撰寫在這個 callback
  //   - form.on('error', ...) 不需再處理 res 相關，避免產生回應兩次的錯誤。這個部分可用來紀錄 log、清理暫存檔、額外監控等等。目前可先有此概念即可，或者初步撰寫如下：
  //     form.on('error', (err) => {
  //       console.log(err); // 記錄 log、清理暫存檔、額外監控可以寫在這邊
  //     });  
  const { method, url } = req;

  // 1. 判斷 HTTP Method 與 URL
  if (method === 'POST' && url === '/coaches/avatar') {
    handleUpload(req, res, config);
  } else {
    handleNotFound(res);
  }
}

/**
 * 處理 404 Not Found
 */
function handleNotFound(res) {
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
}

/**
 * 處理檔案上傳邏輯
 */
function handleUpload(req, res, config) {
  // 建立 formidable 實例並帶入 config 設定
  const form = formidable({
    uploadDir: config.uploadDir,
    maxFileSize: config.maxFileSize,
    keepExtensions: true,
  });

  // 事件監聽：記錄錯誤 Log、清理暫存等（不重複處理 res 回應）
  form.on('error', (err) => {
    console.error('Formidable error event:', err);
  });

  // 解析傳入的表單資料
  form.parse(req, (err, fields, files) => {
    // 情況 A：Formidable 解析出錯（包含超過 maxFileSize）
    if (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
      return;
    }

    // 取得上傳的 file 欄位（注意：Formidable v3 的 files.file 可能會是陣列）
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    // 情況 B：沒有 file 欄位
    if (!file) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No file uploaded' }));
      return;
    }

    // 情況 C：成功，整合前幾個任務的邏輯
    // 1. 使用任務三的邏輯解析 metadata
    const meta = parseFileMetadata(file);

    // 2. 使用任務四的邏輯印出 log
    const log = formatUploadLog(meta, config);
    console.log(log);

    // 3. 回傳 200 + 規格要求的 JSON 物件
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        filename: meta.filename,
        sizeKB: meta.sizeKB,
        ext: meta.ext,
        savedPath: file.filepath, // Formidable v3 保存檔案的路徑屬性名稱為 filepath
      })
    );
  });
}


// ========== 任務六：建立上傳 server ==========
/**
 * 建 http.Server、把每個 request 交給 router。
 *
 * 規格：
 *   - 如果 config.uploadDir 不存在，用 fs.mkdirSync(uploadDir, { recursive: true }) 自動建
 *   - http.createServer(...) 把 request 交給 router(req, res, config)
 *   - 回傳 server instance（不要 server.listen()，那是 app.js 的責任）
 *
 * @param {{uploadDir: string, maxFileSize: number}} config
 * @returns {http.Server}
 *
 * @example
 *   const server = createUploadServer({ uploadDir: '/tmp', maxFileSize: 5 * 1024 * 1024 });
 *   server.listen(3000);  // ← 這行由 app.js 呼叫
 */
function createUploadServer(config) {
  // TODO: 實作此函式
  // 提示：主邏輯都在 router 裡，這邊函式內容不多

  // 1. 檢查 config.uploadDir 資料夾是否存在，若不存在則自動建立   fs.existsSync(...)：檢查資料夾「存在嗎
  if (!fs.existsSync(config.uploadDir)) {
    // { recursive: true } 確保多層級目錄（如 /tmp/uploads/2026）也能一次全部建立
    fs.mkdirSync(config.uploadDir, { recursive: true });
  }

  // 2. 建立 http.Server 實例，將所有 request 派給 router 處理
  const server = http.createServer((req, res) => {
    router(req, res, config);
  });

  // 3. 回傳 server 實例（不要在這邊呼叫 server.listen()）
  return server;
}

module.exports = {
  getUploadConfig,
  getFileExtension,
  parseFileMetadata,
  formatUploadLog,
  router,
  createUploadServer,
};
