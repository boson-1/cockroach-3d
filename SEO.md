# 蟑螂解剖室 SEO 維護筆記

實作日期：2026-09-11。正式網址：<https://maxxc.jamesboson.com/>。

## 本次調整

原本六個 HTML 的正文只有空的 `#app`，需要執行 JavaScript 才能取得物種與器官文字。現在 Vite 於開發與建置時，使用 `src/page-template.js` 和既有物種／解剖資料產生完整 HTML。瀏覽器只為現有頁面加上 3D 互動，不再覆寫正文或縮短頁面標題。正式部署仍是 GitHub Pages 純靜態網站。

- 六頁各有獨立標題、description、canonical、Open Graph 與文字分享摘要。
- 物種辨識、雌雄差異、比較表、全部器官解說與資料來源可在不執行 JavaScript 時閱讀。原有比較解剖的證據限制也保留在正文。
- 器官以原生 `details` 展開，頁面目錄和片段連結協助讀者定位；没有另建大量內容重複的器官網址。
- `WebSite` 與 `WebPage`／`LearningResource` JSON-LD 對應實際頁面、物種、引用與更新日期；沒有虛構作者、評分、專家審核或 rich result 資格。
- 首頁內部連結統一為 `./`，標準網址維持網域根目錄；其他物種保留既有 `.html` 網址。
- Sitemap 記錄內容更新日，仍開放爬取。樣式直接在 HTML 載入，字體新增預連線並移除 CSS 的外部 `@import` 發現鏈。

## 搜尋意圖與內容

| 頁面 | 主要閱讀需求 |
| --- | --- |
| 首頁／美洲蟑螂 | 美洲家蠊辨識、六種比較、蟑螂身體構造與 3D 解剖 |
| 德國蟑螂 | 雙縱紋、小型成蟲、雌雄差異與攜卵鞘習性 |
| 棕色蟑螂 | 短粗尾鬚、外觀與新舊學名對照 |
| 棕帶蟑螂 | 雄性翅帶、雌性短翅與背板腺 |
| 家屋斑蠊 | 花斑蟑螂名稱、退化翅與黑褐底淡斑 |
| 澳洲家蠊 | 翅基黃橙縱紋、雌雄腹端與新舊學名 |

這些是依現有內容整理的閱讀需求，沒有宣稱已取得搜尋量或關鍵字排名資料。保留圖鑑的教育定位；不要為流量加入沒有根據的防治、疾病或農藥建議。

## 2026 官方指引依據

Google 的 [2026 生成式 AI 搜尋指引](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) 強調實用且有特色的內容、可爬取的技術結構與頁面體驗，並說明 Google Search 不使用 `llms.txt` 來提升可見性。本次以既有 3D 圖鑑和有來源的器官說明作為內容主體，沒有加入特製 AI 檔案或堆疊年份關鍵字。

[JavaScript SEO 官方說明](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) 說明爬取、呈現和索引流程，並建議考慮伺服器呈現或預先呈現。本次把原本依賴前端程式產生的正文移到建置階段，同一份 HTML 提供給讀者和爬蟲。

結構化資料必須反映可見內容；標記不保證搜尋功能或排名。[Google 結構化資料一般規範](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

## 驗證與維護

```sh
pnpm test
pnpm build
pnpm test:seo
pnpm test:browser
```

`test:seo` 使用正式 `dist/`，檢查網域根路徑與 GitHub Pages 子路徑下的六頁：不執行 JavaScript 時的內容、唯一標題／描述、canonical、JSON-LD 與可見來源一致性、完整器官條目、站內連結、片段目標，以及 390／320px 排版。CI 在部署前執行，既有六個物種的互動測試仍保留。

內容調整後，同步更新 `src/seo.js` 的 `contentUpdated` 與 `public/sitemap.xml`；`test:seo` 會防止日期或 URL 不一致。形態查核日 `morphologyReviewed` 只有重新核對形態資料時才更新。不要讓每日建置自動刷新內容日期。

## Search Console 追蹤

既有 [Search Console 網址資源](https://search.google.com/search-console?resource_id=https%3A%2F%2Fmaxxc.jamesboson.com%2F) 已驗證，Sitemap 路徑維持 `https://maxxc.jamesboson.com/sitemap.xml`，不必建立另一個資源。

上線後先用網址審查的「測試線上網址」確認 Google 可以取得新版 HTML，再視情況要求重新建立索引。Sitemap 接受提交、即時測試成功、實際索引與搜尋排名是不同階段。成效以 Search Console 的曝光、點擊、查詢、頁面與索引報表為準；Core Web Vitals 使用實際流量資料，不能以本機排版測試宣稱已通過核心指標。
