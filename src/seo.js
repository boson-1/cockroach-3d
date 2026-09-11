import { speciesList } from "./species.js";

export const siteUrl = "https://maxxc.jamesboson.com/";
// Change only when the published page content changes, never on every build.
export const contentUpdated = "2026-09-11";
export const morphologyReviewed = "2026-09-09";
export const pageHref = (species) => species.id === "american" ? "./" : `./${species.page}`;
export const canonicalUrl = (species) => new URL(pageHref(species), siteUrl).href;
export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

const descriptions = {
  american: "美洲蟑螂（美洲家蠊）怎麼辨識？認識紅褐色外觀、32–45 mm 成蟲體長、雌雄差異與卵鞘，透過 3D 解剖圖鑑探索 64 個部位，並比較六種蟑螂的特徵。附器官解說與研究來源。",
  german: "德國蟑螂（德國姬蠊）成蟲約 10–15 mm，前胸背板有兩道深色縱紋。比較雌雄外觀、攜卵鞘習性與雄性背腺，透過 3D 模型和文字圖鑑認識身體構造，附大學資料與研究來源。",
  brown: "棕色蟑螂（棕色家蠊）如何辨識？認識紅褐色外觀、短粗尾鬚與成蟲翅形，釐清 Validiblatta brunnea 和舊學名 Periplaneta brunnea，並用 3D 解剖圖鑑比較雌雄與器官。",
  "brown-banded": "棕帶蟑螂（長鬚帶蠊）如何分辨雌雄？觀察雄性翅帶、雌性短翅與較寬腹部，認識家具等藏身環境及雌性背板費洛蒙腺。附 3D 解剖模型、文字解說及物種研究來源。",
  harlequin: "家屋斑蠊（花斑蟑螂）成蟲約 20–30 mm，具有黑褐底與淡黃斑，前翅退化、沒有後翅。從 3D 圖鑑認識斑紋、腹背板與身體構造，釐清家屋蟑螂名稱，附臺灣物種資料。",
  australian: "澳洲家蠊（澳洲蟑螂）的前翅基部外側有黃橙色縱紋。比較背板邊紋、雌雄腹端及卵鞘習性，釐清 Validiblatta australasiae 與舊學名，搭配 3D 解剖圖鑑與研究來源閱讀。",
};

export function pageMetadata(species) {
  const name = species.id === "harlequin" ? "家屋斑蠊（花斑蟑螂）" : species.name;
  return {
    title: `${name}辨識、雌雄差異與3D解剖圖鑑｜蟑螂解剖室`,
    description: descriptions[species.id],
    url: canonicalUrl(species),
  };
}

export function renderMetadata(species, sources) {
  const metadata = pageMetadata(species);
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite", "@id": `${siteUrl}#website`,
        url: siteUrl, name: "蟑螂解剖室", alternateName: "微觀自然 · 蟑螂解剖室", inLanguage: "zh-Hant",
      },
      {
        "@type": ["WebPage", "LearningResource"], "@id": `${metadata.url}#webpage`,
        url: metadata.url, name: metadata.title, description: metadata.description,
        inLanguage: "zh-Hant", isPartOf: { "@id": `${siteUrl}#website` },
        dateModified: contentUpdated, learningResourceType: "互動解剖圖鑑",
        isAccessibleForFree: true,
        about: {
          "@type": "Thing", name: species.latin,
          alternateName: [...new Set([species.name, species.formal, species.synonym].filter(Boolean))],
          description: species.diagnostic,
        },
        citation: species.refs.map((id) => ({
          "@type": "CreativeWork", name: sources[id].title, url: sources[id].url,
        })),
        hasPart: [
          { "@type": "WebPageElement", "@id": `${metadata.url}#species-notes`, name: `${species.formal}的辨識筆記` },
          { "@type": "WebPageElement", "@id": `${metadata.url}#anatomy-guide`, name: "器官文字圖鑑" },
          { "@type": "WebPageElement", "@id": `${metadata.url}#reading-sources`, name: "資料來源與製作範圍" },
        ],
      },
    ],
  };
  // Serialize defensively: data must never be able to close its script element.
  const json = JSON.stringify(graph).replace(/</g, "\\u003c");
  return `<title>${escapeHtml(metadata.title)}</title>
    <meta name="description" content="${escapeHtml(metadata.description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${metadata.url}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="zh_TW" />
    <meta property="og:site_name" content="蟑螂解剖室" />
    <meta property="og:title" content="${escapeHtml(metadata.title)}" />
    <meta property="og:description" content="${escapeHtml(metadata.description)}" />
    <meta property="og:url" content="${metadata.url}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(metadata.title)}" />
    <meta name="twitter:description" content="${escapeHtml(metadata.description)}" />
    <script type="application/ld+json">${json}</script>`;
}

export function renderReadingGuide(species, organs, sources, systems) {
  const e = escapeHtml;
  const sourceLinks = (refs) => refs.map((id) => `<a href="${e(sources[id].url)}" target="_blank" rel="noopener noreferrer">${e(sources[id].label ?? sources[id].title)}</a>`).join("、");
  return `<section class="reading-guide" id="anatomy-guide" aria-labelledby="anatomy-heading">
      <div class="reading-heading"><span class="eyebrow">ANATOMY READING GUIDE</span><h2 id="anatomy-heading">${e(species.name)}的器官文字圖鑑</h2><p>依六個系統閱讀 ${organs.length} 個部位的位置、功能與資料依據。雌雄專有構造分別標示；展開條目即可閱讀完整解說。</p></div>
      <p class="reading-evidence">${e(species.evidence)}</p>
      ${systems.map((system) => `<section class="anatomy-system" aria-labelledby="reading-${system.id}"><h3 id="reading-${system.id}">${e(system.name)}</h3>
        ${organs.filter((organ) => organ.system === system.id).map((organ) => `<details class="anatomy-entry" id="anatomy-${organ.id}">
          <summary>${String(organ.id).padStart(2, "0")} · ${e(organ.name)}${organ.sex ? `（${organ.sex === "female" ? "雌性" : "雄性"}）` : ""}</summary>
          <div class="anatomy-entry-body"><p class="latin">${e(organ.en)}</p><p><strong>位置：</strong>${e(organ.location)}</p>
          <p class="reading-evidence">${e(organ.evidence)}</p><p>${e(organ.description)}</p><p>${e(organ.detail)}</p><p><strong>觀察筆記：</strong>${e(organ.note)}</p>
          ${organ.referenceDetail ? `<details><summary>比較來源的詳細解說（美洲蟑螂）</summary><p>${e(organ.referenceDetail)}</p></details>` : ""}
          <p class="reading-citations">資料依據：${sourceLinks(organ.refs)}</p></div>
        </details>`).join("\n")}</section>`).join("\n")}
    </section>
    <section class="reading-guide" id="reading-sources" aria-labelledby="reading-sources-heading">
      <div class="reading-heading"><span class="eyebrow">SOURCES & METHOD</span><h2 id="reading-sources-heading">資料來源與製作範圍</h2></div>
      <p>微觀自然 · 蟑螂解剖室是繁體中文互動解剖圖鑑。文字依大學昆蟲學教材、物種資料與研究重新整理，3D 幾何與紋理以程式繪製；圖鑑節錄用於外觀核對，本站未嵌入原書照片。</p>
      <p>${e(species.evidence)} 模型依照片與文獻重建，並非 CT 掃描分割或可量測標本；掀層路徑是展示操作。標示「比較解剖」的條目採美洲蟑螂為參考，不代表本頁物種的實測數據。</p>
      <p class="reading-dates">頁面內容更新：<time datetime="${contentUpdated}">${contentUpdated}</time> · 形態資料核對：<time datetime="${morphologyReviewed}">${morphologyReviewed}</time></p>
      <ul class="reading-source-list">${species.refs.map((id) => `<li><a href="${e(sources[id].url)}" target="_blank" rel="noopener noreferrer">${e(sources[id].title)}</a><p>${e(sources[id].author)}</p><p>${e(sources[id].scope)}</p></li>`).join("\n")}</ul>
      <p>各器官的資料依據另列於上方文字條目。<a href="https://github.com/boson-1/cockroach-3d/blob/main/RESEARCH.md">閱讀完整研究筆記</a> · <a href="https://github.com/boson-1/cockroach-3d/issues">回報內容錯誤</a></p>
    </section>`;
}

export function renderSitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${speciesList.map((species) => `  <url><loc>${canonicalUrl(species)}</loc><lastmod>${contentUpdated}</lastmod></url>`).join("\n")}\n</urlset>\n`;
}
