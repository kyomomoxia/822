const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// =================================================================
// 👑 【老板核心机密区】
// =================================================================
const SECRET_SALT = "MAX_YINGYIN_888999"; 
const BOSS_PWD = "666"; 
const blacklist = []; 

function getSecureSuffix(monthStr) {
    let str = monthStr + SECRET_SALT;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash; 
    }
    let suffix = Math.abs(hash).toString(36);
    while (suffix.length < 4) suffix = "0" + suffix;
    return suffix.substring(0, 4);
}

// 🧠 时空算力引擎
function isTokenValid(token) {
    if (!token) return false;
    if (blacklist.includes(token)) return false; 

    const tokenYear = parseInt(token.substring(0, 4), 10);
    const tokenMonth = parseInt(token.substring(4, 6), 10);
    if (isNaN(tokenYear) || isNaN(tokenMonth)) return false;

    const now = new Date(new Date().getTime() + 8 * 3600000);
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth() + 1; 

    const tokenAbsolute = tokenYear * 12 + tokenMonth;
    const currentAbsolute = currentYear * 12 + currentMonth;
    const diff = currentAbsolute - tokenAbsolute;

    if (diff < -1) return false; 
    if (diff >= 13) return false; 

    return true;
}

// =================================================================
// 🖥️ 核心拦截器：浏览器拦截与引导网页
// =================================================================
app.use((req, res, next) => {
    const acceptHeader = req.get("Accept") || "";
    const userAgent = req.get("User-Agent") || "";
    
    if (req.path.toLowerCase() === "/boss888") return next();

    const isWebBrowser = acceptHeader.includes("text/html") || (userAgent.includes("Mozilla/") && !userAgent.includes("okhttp"));

    if (isWebBrowser) {
        let currentUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        if (!currentUrl.toLowerCase().includes('.json')) {
            currentUrl = req.protocol + '://' + req.get('host') + "/index.json"; 
        }

        const html = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MAX智能影音 - 专属私人接口配置</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body {
                    background: #0a0a12;
                    background-image: radial-gradient(at 10% 20%, rgba(255, 59, 48, 0.15) 0px, transparent 50%),
                                      radial-gradient(at 90% 80%, rgba(50, 100, 255, 0.15) 0px, transparent 50%);
                    color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px;
                }
                .container {
                    width: 100%; max-width: 600px; background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08); backdrop-filter: blur(20px); border-radius: 24px;
                    padding: 40px 30px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }
                .logo { font-size: 42px; margin-bottom: 12px; }
                h1 { font-size: 24px; font-weight: 600; margin-bottom: 8px; background: linear-gradient(90deg, #fff, #a5a5b5); -webkit-background-clip: text; -webkit-text-fill-color: transparent;}
                .subtitle { color: #8e8e9f; font-size: 14px; margin-bottom: 32px; }
                .url-card { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 8px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; gap: 10px; }
                .url-text { font-family: monospace; color: #4cd964; font-size: 14px; padding-left: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; user-select: all; }
                .btn-copy { background: linear-gradient(135deg, #ff3b30, #ff9500); color: white; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; flex-shrink: 0; }
                .steps { text-align: left; background: rgba(255,255,255,0.02); padding: 20px; border-radius: 16px; font-size: 13px; line-height: 1.8; color: #b0b0c0;}
                .steps b { color: #fff; }
            </style>
        </head>
        <body>
        <div class="container">
            <div class="logo">🎬</div>
            <h1>MAX 智能影音专属配置</h1>
            <p class="subtitle">全网极速源 · 亚太全自动直连分发</p>
            <div class="url-card">
                <span class="url-text" id="dynamicUrl">${currentUrl}</span>
                <button class="btn-copy" id="copyBtn" onclick="doCopy()">一键复制接口</button>
            </div>
            <div class="steps">
                <b>💡 配置指南：</b><br>
                1. 点击上方按钮，复制您的<b>专属配置链接</b>。<br>
                2. 打开电视端（影视仓 / TVBox 等）。<br>
                3. 进入 <b>设置 -> 配置地址</b>，粘贴并确定即可。
            </div>
        </div>
        <script>
            function doCopy() {
                const text = document.getElementById('dynamicUrl').innerText;
                const btn = document.getElementById('copyBtn');
                navigator.clipboard.writeText(text).then(() => {
                    btn.innerText = "✅ 复制成功";
                    btn.style.background = "#34c759";
                    setTimeout(() => { btn.innerText = "一键复制接口"; btn.style.background = ""; }, 2500);
                });
            }
        </script>
        </body>
        </html>
        `;
        return res.send(html);
    }
    next();
});

// =================================================================
// 🖥️ 老板专属算号后台
// =================================================================
app.get('/boss888', (req, res) => {
    const pwd = req.query.pwd;
    if (pwd !== BOSS_PWD) {
        return res.send(`
            <html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="background:#0a0a12;color:#fff;text-align:center;padding:20vh 20px;">
                <h2>👑 MAX老板安全验证</h2>
                <script>
                    let p = prompt("请输入 MAX 核心控制台密码：");
                    if(p) window.location.href = "/boss888?pwd=" + p;
                </script>
            </body></html>
        `);
    }

    let listHtml = "";
    const now = new Date(new Date().getTime() + 8 * 3600000); 
    let y = now.getUTCFullYear();
    let m = now.getUTCMonth() + 1;

    for(let i = 0; i < 120; i++) {
        let checkY = y + Math.floor((m - 1 + i) / 12);
        let checkM = ((m - 1 + i) % 12) + 1;
        let monthStr = checkY.toString() + (checkM < 10 ? "0" + checkM : checkM);
        let suffix = getSecureSuffix(monthStr);
        let finalUrl = `https://${req.get('host')}/${monthStr}${suffix}.json`;
        
        listHtml += `
            <div style="background:#1c1c28; margin-bottom:15px; padding:15px; border-radius:10px; text-align:left;">
                <span style="color:#8e8e9f; font-size:14px;">发给新客户 (${monthStr}) :</span><br>
                <b style="color:#4cd964; font-size:16px; font-family:monospace; user-select:all;">${finalUrl}</b>
            </div>
        `;
    }

    res.send(`
        <html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="background:#0a0a12;color:#fff;text-align:center;padding:30px 15px;font-family:sans-serif;">
            <h2 style="margin-bottom:5px;">👑 MAX 影音发卡机 (亚太专线版)</h2>
            <p style="color:#8e8e9f;font-size:13px;margin-bottom:30px;">全自动加密版 · 动态生成未来10年</p>
            ${listHtml}
        </body></html>
    `);
});

// =================================================================
// 🚀 核心路由与多仓生成
// =================================================================
app.get('/*', (req, res) => {
    let userToken = req.query.token;
    if (!userToken) userToken = "202607"; // 老客户保底补丁

    const hasValidAccess = isTokenValid(userToken);
    const reqPath = req.path;

    // 保护底层新主线 822.json（从仓库本地读取下发）
    if (reqPath.toLowerCase() === "/822.json") {
        if (hasValidAccess) {
            return res.sendFile(path.join(__dirname, '822.json'));
        } else {
            return res.json({ "sites": [] });
        }
    }

    // 16路隐形弹射
    const routes = {
        "/line1.json": "https://xn--ohqo134kjk7c.v.nxog.top/apitv.php?id=1",
        "/line2.json": "https://xn--ohqo134kjk7c.v.nxog.top/apitv.php?id=3",
        "/line3.json": "https://xn--ohqo134kjk7c.v.nxog.top/apitv.php?id=2",
        "/line4.json": "https://xn--ohqo134kjk7c.v.nxog.top/apitv.php?id=4",
        "/line5.json": "https://xn--ohqo134kjk7c.v.nxog.top/apitv.php?id=5",
        "/line6.json": "https://xn--ohqo134kjk7c.v.nxog.top/apitv.php?id=6",
        "/line7.json": "https://xn--ohqo134kjk7c.v.nxog.top/apitv.php?id=8",
        "/line8.json": "https://xn--ohqo134kjk7c.v.nxog.top/apitv.php?id=10",
        "/line9.json": "https://xn--ohqo134kjk7c.v.nxog.top/apitv.php?id=11",
        "/line10.json": "https://xn--ohqo134kjk7c.v.nxog.top/apitv.php?id=12",
        "/line11.json": "https://xn--ohqo134kjk7c.v.nxog.top/apitv.php?id=13",
        "/line12.json": "https://xn--ohqo134kjk7c.v.nxog.top/apitv.php?id=15",
        "/line13.json": "https://xn--ohqo134kjk7c.v.nxog.top/apitv.php?id=16",
        "/line14.json": "https://xn--ohqo134kjk7c.v.nxog.top/apitv.php?id=17",
        "/line15.json": "https://xn--ohqo134kjk7c.v.nxog.top/apitv.php?id=18",
        "/line16.json": "https://xn--ohqo134kjk7c.v.nxog.top/apitv.php?id=20"
    };

    if (routes[reqPath]) {
        if (hasValidAccess) return res.redirect(302, routes[reqPath]);
        return res.json({ "sites": [] });
    }

    // 自动生成多仓
    const secureMatch = reqPath.match(/^\/(\d{6})([a-z0-9]{4})\.json$/);
    const oldMatch = reqPath.match(/^\/(\d{6})\.json$/); 

    let reqMonth = null;
    let finalToken = null;
    let isRequestValid = false;

    if (secureMatch) {
        reqMonth = secureMatch[1]; 
        let reqSuffix = secureMatch[2]; 
        if (reqSuffix === getSecureSuffix(reqMonth) && isTokenValid(reqMonth + reqSuffix)) {
            finalToken = reqMonth + reqSuffix; 
            isRequestValid = true;
        }
    } else if (oldMatch) {
        reqMonth = oldMatch[1];
        if ((reqMonth === "202606" || reqMonth === "202607") && isTokenValid(reqMonth)) {
            finalToken = reqMonth; 
            isRequestValid = true;
        }
    }

    if (reqMonth) {
        if (isRequestValid) {
            
            // 旧船票拦截机制
            const tYear = parseInt(reqMonth.substring(0, 4), 10);
            const tMonth = parseInt(reqMonth.substring(4, 6), 10);
            const nTime = new Date(new Date().getTime() + 8 * 3600000);
            const diffEntry = (nTime.getUTCFullYear() * 12 + nTime.getUTCMonth() + 1) - (tYear * 12 + tMonth);

            if (diffEntry > 0) {
                return res.json({
                    "urls": [
                        { "name": `⚠️ 此月份配置入口已永久关闭`, "url": "https://kyomomo.top/empty.json" },
                        { "name": "👉 已配置的老设备正常观看不受影响", "url": "https://kyomomo.top/empty.json" },
                        { "name": "👉 新设备请联系老板获取当月专属", "url": "https://kyomomo.top/empty.json" }
                    ]
                });
            }

            const validConfig = {
                "urls": [
                    { "name": `💖 ${reqMonth} VIP专属主线 💖`, "url": `https://${req.get('host')}/822.json?token=${finalToken}` },
                    { "name": "专业影音收集一", "url": `https://${req.get('host')}/line1.json?token=${finalToken}` },
                    { "name": "专业影音收集二", "url": `https://${req.get('host')}/line2.json?token=${finalToken}` },
                    { "name": "专业影音收集三", "url": `https://${req.get('host')}/line3.json?token=${finalToken}` },
                    { "name": "专业影音收集四", "url": `https://${req.get('host')}/line4.json?token=${finalToken}` },
                    { "name": "专业影音收集五", "url": `https://${req.get('host')}/line5.json?token=${finalToken}` },
                    { "name": "专业影音收集六", "url": `https://${req.get('host')}/line6.json?token=${finalToken}` },
                    { "name": "专业影音收集七", "url": `https://${req.get('host')}/line7.json?token=${finalToken}` },
                    { "name": "专业影音收集八", "url": `https://${req.get('host')}/line8.json?token=${finalToken}` },
                    { "name": "专业影音收集九", "url": `https://${req.get('host')}/line9.json?token=${finalToken}` },
                    { "name": "专业影音收集十", "url": `https://${req.get('host')}/line10.json?token=${finalToken}` },
                    { "name": "专业影音收集十一", "url": `https://${req.get('host')}/line11.json?token=${finalToken}` },
                    { "name": "专业影音收集十二", "url": `https://${req.get('host')}/line12.json?token=${finalToken}` },
                    { "name": "专业影音收集十三", "url": `https://${req.get('host')}/line13.json?token=${finalToken}` },
                    { "name": "专业影音收集十四", "url": `https://${req.get('host')}/line14.json?token=${finalToken}` },
                    { "name": "专业影音收集十五", "url": `https://${req.get('host')}/line15.json?token=${finalToken}` },
                    { "name": "专业影音收集十六", "url": `https://${req.get('host')}/line16.json?token=${finalToken}` }
                ]
            };
            return res.json(validConfig);
        } else {
            return res.json({
                "urls": [
                    { "name": `⚠️ 您输入的授权配置不合法或已过期`, "url": "https://kyomomo.top/empty.json" },
                    { "name": "👉 请联系微信获取专属授权码", "url": "https://kyomomo.top/empty.json" }
                ]
            });
        }
    }

    res.status(404).send('Not Found');
});

app.listen(port, () => {
    console.log(`MAX Server is running on port ${port}`);
});
