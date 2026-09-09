# 微觀自然 · 蟑螂解剖室

以立體書的掀頁概念製作的繁體中文互動解剖圖鑑。使用 Three.js 即時繪製六種蟑螂的曲面模型，包含各物種外觀、部位索引、雌雄切換及可追溯的比較解剖筆記。立體書提供操作概念；形態與知識依照片、解剖教材及物種研究重建。

## 六種標本頁面

| 頁面                | 物種                                  | 可選部位 | 本種模型差異                                                       |
| ------------------- | ------------------------------------- | -------: | ------------------------------------------------------------------ |
| `index.html`        | 美洲蟑螂 · _Periplaneta americana_    |       64 | 紅褐色長翅、淡色前胸背板邊緣                                       |
| `german.html`       | 德國蟑螂 · _Blattella germanica_      |       65 | 前胸背板雙縱紋、雌雄體寬、每側約 20 條卵巢管、雄性第 7／8 腹背板腺 |
| `brown.html`        | 棕色蟑螂 · _Validiblatta brunnea_     |       64 | 較短粗尾鬚、較不鮮明背板斑；舊學名 _Periplaneta brunnea_           |
| `brown-banded.html` | 棕帶蟑螂 · _Supella longipalpa_       |       65 | 雌雄不同的翅面、雌性短翅與較寬腹部、雌性第 4／5 腹背板費洛蒙腺     |
| `harlequin.html`    | 家屋斑蠊 · _Neostylopyga rhombifolia_ |       63 | 斑紋外露背板、側邊退化前翅，完全移除後翅                           |

| `australian.html` | 澳洲家蠊 · _Validiblatta australasiae_ | 64 | 前翅外側基部黃縱紋、淡黃背板邊紋、雌雄腹刺差異；旧名 _Periplaneta australasiae_ |

這些都是正式建置會輸出的 HTML 頁面，可以直接分享、重新整理與部署到 GitHub Pages 子路徑。物種導覽與並排比較表連到各自網址。各模型分別放大到視窗，不能把畫面大小當成相同實體比例尺。

**證據範圍：**美洲蟑螂保留原本 32 筆資料；新增物種另納入 23 筆分類、政府／大學物種資料、圖鑑節錄與研究。已核對的本種部位標示為本種資料；未有直接依據的內臟明示「比較解剖 · 參考物種：美洲蟑螂」，原參考物種的詳細敘述放在可展開的來源解說中。這些曲面模型並非六種標本的 CT 分割，尚不能作微細解剖或分類鑑定的量測模型。

## 本機啟動

使用 Node.js 24 與 pnpm 11.19.0（版本已記錄在 `package.json`）。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

開啟終端機顯示的本機網址，預設為 http://127.0.0.1:5173 。不要直接用 `file://` 打開 HTML，瀏覽器需要透過 HTTP 載入模組。

```sh
pnpm test            # 器官、性別、翻片層次與來源對應測試
pnpm build           # 產生 dist/ 靜態網站
pnpm preview         # 預覽正式版本
```

新增澳洲家蠊依使用者圖鑑節錄重建黃橙翅基縱紋、暗色前胸背板與淡黃邊紋，並核對 UF/IFAS 成蟲與腹端資料。棕帶蟑螂使用雌雄分別繪製的翅面；家屋斑蠊以黑底、側緣淡斑及 M 形前緣呈現。

## 互動方式

- **懸停掀頁**：移到前翅、後翅或背板上，翻片抬起；移出標本則闔上。
- **點按固定**：點一下翻片固定開啟，也可用左欄直接選擇深度；手機用點按。
- **選擇部位**：點模型編號或左側目錄，閱讀器官位置、功能、觀察筆記與來源。
- **六個系統**：外部構造、消化與排泄、呼吸、循環與代謝、神經與感官、生殖。選擇內部系統會展開所有翻片，淡化其他系統。
- **雌雄比較**：切換卵巢、輸卵管、受精囊、附膠腺，以及精巢、輸精管、附屬腺、射精管。
- **視角**：立體、俯視、側面與腹面，拖曳轉動，滾輪或按鈕縮放。
- **局部觀察**：器官面板可獨立放大所選部位，檢查足節、口器、前胃內齒、直腸墊等；再次點按返回全身。
- **配色**：預設自然配色，另可切換系統辨識色；自然色是組織外觀近似，並非經色卡校準的標本取樣。
- **鍵盤**：Tab 巡覽；按鈕以 Enter／空白鍵操作；聚焦模型後用左右方向鍵控制層次、Esc 闔上、＋／－縮放。
- **無 WebGL**：3D 顯示需要 WebGL 2；不支援時仍能閱讀全部器官與文獻。

## GitHub Pages 與自訂網域

儲存庫：[boson-1/cockroach-3d](https://github.com/boson-1/cockroach-3d)。網站網域：[maxxc.jamesboson.com](https://maxxc.jamesboson.com/)。

本專案是純靜態網站，沒有後端、金鑰或伺服器資料庫。推送 `main` 時，`.github/workflows/deploy.yml` 會安裝固定版本依賴、執行單元與瀏覽器測試、建置六個 HTML 頁面，再將 `dist/` 部署至 GitHub Pages。也可從 [Actions](https://github.com/boson-1/cockroach-3d/actions/workflows/deploy.yml) 手動執行。

GitHub 的 **Settings → Pages** 使用 **GitHub Actions**，Custom domain 設為 `maxxc.jamesboson.com`。自訂工作流程的網域設定由 GitHub Pages 設定／API 管理，`CNAME` 檔案不是設定來源。

Squarespace Domains 的 **jamesboson.com → DNS → DNS Settings → Custom Records** 對應以下記錄：

| Type | Name / Host | Data / Alias | TTL |
| --- | --- | --- | --- |
| CNAME | `maxxc` | `boson-1.github.io` | 預設值 |

DNS 目標不含 `https://`、路徑或 repo 名稱。DNS 生效後，GitHub 會為自訂網域申請憑證；憑證可用時啟用 **Enforce HTTPS**。網站可用狀態以 [Pages 設定](https://github.com/boson-1/cockroach-3d/settings/pages) 與實際 HTTPS 回應為準。

`vite.config.js` 使用相對路徑 `base: './'`，可同時支援網域根目錄與 GitHub Pages 專案子路徑。瀏覽器測試實際從 `/cockroach-atlas/` 載入正式建置。工作流程只上傳 `dist/`；測試截圖、參考掃描頁、PAT 及開發暫存副本都不在部署產物中。

設定依據：[GitHub Pages 自訂工作流程](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[GitHub 自訂子網域](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain)、[Squarespace DNS 記錄](https://support.squarespace.com/hc/en-us/articles/31119879125645-DNS-records-for-web-hosting)。

## 瀏覽器整合測試

測試直接服務 `dist/`，不需要先啟動開發伺服器。Windows 使用已安裝的 Microsoft Edge；macOS／Linux 先安裝 Playwright Chromium：

```sh
pnpm exec playwright install chromium
pnpm build
pnpm test:browser
```

在 Linux CI 使用 `pnpm exec playwright install --with-deps chromium`。測試包含實際滑鼠射線掀頁、移出復原、點按固定、六種標本的全部部位、雌雄形態與腺區互斥、鍵盤、視角、標註、文獻對話框、320／390px 排版、觸控、WebGL 失敗降級及 GitHub Pages 子路徑。診斷介面 `window.atlasDiagnostics()` 只讀取狀態，不修改資料。

## 結構

| 檔案                        | 內容                                                 |
| --------------------------- | ---------------------------------------------------- |
| `src/species.js`            | 六種物種、獨立路徑、外觀及雌雄參數                   |
| `src/atlas-data.js`         | 本種與比較解剖的證據範圍、專屬器官條目               |
| `src/species-sources.js`    | 新增物種的 23 筆來源                                 |
| `src/data.js`               | 64 個器官的文字、系統分類、性別、文獻對應            |
| `src/specimen.js`           | 器官幾何、解剖層、選取、自然／系統配色與三維錨點     |
| `src/morphology.js`         | 曲面殼體、頭胸腹、分節足與觸角、翅面／背板微表面紋理 |
| `src/anatomy-detail.js`     | 新增的 27 個解剖部位及物種形態研究來源               |
| `src/main.js`               | 介面、滑鼠與觸控互動、鏡頭、標註避讓、科學筆記       |
| `src/style.css`             | 版面、紙本圖鑑視覺、響應式配置                       |
| `tests/anatomy.test.js`     | 資料與模型的整合檢查                                 |
| `scripts/browser-check.mjs` | 正式建置的瀏覽器操作測試                             |

模型把同一器官的同材質幾何合併，保留每個器官的選取能力，降低繪製次數；標註由三維錨點投影到畫面，會跟隨翻片與轉動。動態效果尊重 `prefers-reduced-motion`，頁面不在前景時暫停動畫迴圈。

## 科學與製作範圍

互動架構參考使用者提供的五張立體書照片。01–16 延續照片中的器官編號；17–64 補充其他主要構造。書名、作者、版次無法從這些照片確定，未臆造書目。原書照片與掃描圖沒有加入網站或 Git 儲存庫。

外部形態另依使用者補充的美洲、澳洲、棕色、德國、棕帶與家屋蟑螂各頁《台灣常見室內節肢動物圖鑑》節錄調整。作者李鍾旻、詹美鈴與 2021 年出版資訊已向[聯經出版](https://store.linkingbooks.com.tw/product/141181)核對。模型更新紅褐色翅面光澤、翅的重疊、近 T 形背板斑紋、長觸角、腎形複眼與尖棘；這是個體外觀示例，並非固定不變的辨識模板。

文字經重新整理，幾何與紋理為程式原創。研究來源以美洲蟑螂原始論文及大學昆蟲學教材為主，逐一連結在器官面板及「文獻與製作筆記」。完整索引另見 [RESEARCH.md](RESEARCH.md)。公開全文與摘要依實際可取得範圍核對，只有書目可讀的歷史文獻另有註記。

目前是**文獻與照片約束的宏觀形態重建**：曲面外骨骼、分節附肢、咀嚼口器、較自然的組織配色，以及不同深度的內部器官。包含 150 條馬氏管的近似路徑、每側 8 條卵巢管、3 個胸神經節與 6 個腹神經節、兩側共 10 對氣門的位置。局部重複構造與微表面仍屬近似；不能從幾何數量推論個體的真實細胞或感覺器數目。

**尚不能宣稱為掃描標本或完整解剖學標準模型**：沒有導入原始 CT 體素／分割網格、組織切片或個體量測。每條肌肉的起止點、全部翅脈定名、全部氣管微分支、神經纖維、內分泌腺及複雜外生殖器硬片尚未全部重建。掀開的路徑為展示操作，並非動物關節。研究與模型的對應、簡化與待補範圍記錄在 [RESEARCH.md](RESEARCH.md)。

字體透過 Google Fonts 載入 Noto Sans TC／Noto Serif TC；無網路時使用系統字體。Three.js 與 Lucide 隨建置打包，3D 模型無外部圖片或模型下載需求。
