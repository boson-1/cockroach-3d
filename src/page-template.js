import { createAtlasData, systems } from "./atlas-data.js";
import { speciesList, layersFor } from "./species.js";
import { renderReadingGuide, pageHref } from "./seo.js";
const icon = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
const pad = (id) => String(id).padStart(2, "0");

// Rendered by Vite for both development and the static GitHub Pages build.
export function renderAtlasPage(species) {
  const { organs, organById, sources } = createAtlasData(species);
  const layerOptions = layersFor(species);
  return `
  <a class="skip-link" href="#workspace">跳至互動圖鑑</a><a class="skip-link" href="#anatomy-guide">跳至器官文字圖鑑</a>
  <header class="site-header">
    <a class="brand" href="./" aria-label="蟑螂解剖室首頁"><span class="brand-mark">${icon("book-open")}</span><span>微觀自然<span class="brand-en">THE SMALL WORLD</span></span></a>
    <div class="edition">自然觀察手帖 <span>／</span> VOL. 00${species.number.slice(-1)}</div>
    <button class="text-button" id="sources-open">文獻與製作筆記 ${icon("arrow-up-right")}</button>
  </header>
  <main>
    <section class="intro" aria-labelledby="page-title">
      <div><div class="eyebrow"><span></span> AN INTERACTIVE ANATOMY ATLAS</div><h1 id="page-title">${species.name}<span class="title-dot">，</span><br class="species-title-break">辨識與解剖。</h1></div>
      <div class="intro-right"><p>${species.tagline}<br>從外骨骼到內部器官，親手翻閱牠的身體。</p><span class="specimen-meta"><i>${species.latin}</i><span>${species.formal} · 成蟲</span></span></div>
    </section>
    <nav class="species-nav" aria-label="選擇蟑螂物種">${speciesList.map((s) => `<a href="${pageHref(s)}" class="species-link ${s.id === species.id ? "current" : ""}" ${s.id === species.id ? 'aria-current="page"' : ""}><span class="species-swatch ${s.pattern}" aria-hidden="true"></span><span><strong>${s.name}</strong><small>${s.size}</small></span><span class="species-number">${s.number}</span></a>`).join("")}</nav>
    <div class="species-context"><span>標本 ${species.number} / ${String(speciesList.length).padStart(2, "0")}</span><p>${species.diagnostic}</p><span class="size-chip">體長 ${species.size}</span></div>
    <nav class="system-tabs" aria-label="探索器官系統">${systems.map((s, i) => `<button data-system="${s.id}" class="system-tab ${i === 0 ? "active" : ""}" aria-pressed="${i === 0}" style="--system-color:${s.color}">${icon(s.icon)}<span>${s.name}</span><span class="tab-index">0${i + 1}</span></button>`).join("")}</nav>
    <section class="workbench" id="workspace" aria-label="互動立體解剖圖鑑">
      <aside class="layer-panel">
        <div class="panel-kicker">翻閱層次 <span>LAYERS</span></div>
        <div class="layer-list" aria-label="解剖深度">${layerOptions.map(({ label: s, depth: i }) => `<button class="layer-button ${i === 0 ? "active" : ""}" data-depth="${i}" aria-pressed="${i === 0}"><span class="layer-number">${i === 0 ? "○" : pad(i)}</span><span>${s}</span>${icon("chevron-right")}</button>`).join("")}</div>
        <button class="open-all" id="open-all">${icon("layers")}<span>逐層展開</span>${icon("arrow-right")}</button>
        <div class="sex-control"><label>觀察標本</label><div role="group" aria-label="標本性別"><button data-sex="female" class="active" aria-pressed="true">♀ 雌性</button><button data-sex="male" aria-pressed="false">♂ 雄性</button></div></div>
        <div class="index-heading"><span id="list-title">本頁部位</span><span id="list-count"></span></div>
        <div class="organ-list" id="organ-list" aria-label="器官目錄"></div>
        <div class="layer-footnote"><span class="small-rule"></span><span>沿著編號，認識每一個部位。</span></div>
      </aside>
      <div class="stage" id="stage">
        <div class="stage-heading"><span>PLATE ${species.number} <span class="hairline">/</span> <span id="plate-title">外部構造</span></span><span class="live-indicator">3D 標本</span></div>
        <canvas id="specimen-canvas" aria-label="${species.name}立體模型。滑鼠移至覆蓋層可掀開，點按可固定；也可使用左側按鈕與器官目錄。" tabindex="0"></canvas>
        <div class="render-controls" role="group" aria-label="模型配色"><button data-palette="natural" class="active" aria-pressed="true">自然配色</button><button data-palette="system" aria-pressed="false">系統配色</button><span id="render-mode-note">外觀近似原色</span></div>
        <div id="markers" class="markers"></div>
        <div class="model-fallback" id="model-fallback" hidden><h2>目前無法顯示 3D 標本</h2><p>瀏覽器需要支援 WebGL 2。你仍可透過左側器官目錄閱讀完整圖鑑與文獻。</p></div>
        <div class="orientation"><span>頭側</span><span class="axis-line"></span><span>腹端</span></div>
        <div class="view-tools" role="group" aria-label="模型視角"><button data-view="book" class="active" aria-pressed="true">立體</button><button data-view="top" aria-pressed="false">俯視</button><button data-view="side" aria-pressed="false">側面</button><button data-view="ventral" aria-pressed="false">腹面</button></div>
        <div class="canvas-tools"><button id="labels-toggle" title="切換部位標註" aria-label="切換部位標註" aria-pressed="true">${icon("scan")}</button><span></span><button id="zoom-in" title="放大" aria-label="放大">${icon("plus")}</button><button id="zoom-out" title="縮小" aria-label="縮小">${icon("minus")}</button><button id="reset-view" title="還原標本" aria-label="還原標本">${icon("rotate-ccw")}</button></div>
        <div class="hover-cue" id="hover-cue">${icon("mouse-pointer-2")}<span>${species.reducedWings ? "移到胸部小翅片，開始探索" : "移到翅上，試著掀開它"}</span><span class="cue-arrow">↗</span></div>
        <div class="stage-bottom"><span id="depth-caption">外觀 · 尚未掀頁</span><span>各頁放大展示 · 非等比例尺</span></div>
      </div>
      <aside class="detail-panel" aria-label="器官解說"><div id="organ-detail" aria-live="polite"></div><div class="detail-navigation"><button id="prev-organ" aria-label="上一個部位">${icon("arrow-left")}</button><span id="detail-position"></span><button id="next-organ" aria-label="下一個部位">${icon("arrow-right")}</button></div></aside>
    </section>
    <p class="species-evidence">${icon("info")}<span>${species.evidence}</span></p>
    <section class="reading-strip" aria-label="操作提示"><div>${icon("mouse-pointer-2")}<span><strong>移入掀開</strong>，移開自動闔上</span></div><div>${icon("layers")}<span><strong>點按固定</strong>，逐層探索內部</span></div><div>${icon("move")}<span><strong>拖曳轉動</strong>，滾輪縮放標本</span></div><button id="help-open">操作說明 ${icon("info")}</button></section>
    <nav class="reading-nav" aria-label="本頁閱讀目錄"><a href="#species-notes">物種辨識</a><a href="#species-comparison">六種比較</a><a href="#anatomy-guide">器官文字圖鑑</a><a href="#reading-sources">資料來源</a></nav>
    <section id="species-notes" class="species-dossier" aria-label="本種觀察筆記"><div class="dossier-heading"><span class="eyebrow">SPECIES FIELD NOTES</span><h2>${species.formal}的辨識筆記</h2><i>${species.latin}</i>${species.synonym ? `<p>文獻舊名：<i>${species.synonym}</i></p>` : ""}</div><div class="dossier-grid"><article><span>01 / 形態</span><p>${species.diagnostic}</p></article><article><span>02 / 雌雄</span><p id="sex-field-note">${species.sexNote}</p></article><article><span>03 / 環境</span><p>${species.habitat}</p></article><article><span>04 / 生殖</span><p>${species.reproduction}</p></article></div><div class="feature-links"><span>重點觀察</span>${species.featureParts.map((id) => `<button data-organ="${id}">${pad(id)} · ${organById.get(id).name} ${icon("arrow-up-right")}</button>`).join("")}</div>${species.taxonomyNote ? `<p class="taxonomy-note">${species.taxonomyNote}</p>` : ""}<div class="dossier-sources">${species.refs.map((ref) => `<a href="${sources[ref].url}" target="_blank" rel="noopener noreferrer">${sources[ref].author} ↗</a>`).join("")}</div></section>
    <details id="species-comparison" class="species-comparison"><summary>${speciesList.length} 種蟑螂，並排比較 <span>體長與主要辨識線索</span></summary><div class="comparison-scroll"><table><caption>體長範圍來自各物種引用來源；個體與測量方式可能不同。3D 畫面各自放大，不能用畫面大小比較體長。</caption><thead><tr><th scope="col">物種</th><th scope="col">成蟲體長</th><th scope="col">辨識線索</th><th scope="col">成蟲翅</th></tr></thead><tbody>${speciesList.map((s) => `<tr><th scope="row"><a href="${pageHref(s)}">${s.name}</a><i>${s.latin}</i></th><td>${s.size}<span class="size-bar" style="width:${s.mm * 2}px"></span></td><td>${s.diagnostic}</td><td>${s.sexNote}</td></tr>`).join("")}</tbody></table></div></details>
    <section class="field-note"><div class="note-number">01<span>FIELD NOTE</span></div><div><h2>小小的身體，六套協作的系統。</h2><p>呼吸不靠肺，循環不靠紅色的血。選擇上方系統，觀察每個器官的位置與分工。<br>這本圖鑑以雌性成蟲起始；切換雄性標本，可以比較生殖系統的差異。</p></div><div class="progress-note"><span><strong id="seen-count">1</strong> / ${organs.length}</span><span>已探索的部位</span></div></section>
    ${renderReadingGuide(species, organs, sources, systems)}
    <footer><span>微觀自然 <span class="footer-dot">·</span> 蟑螂解剖室</span><span>形態與解剖重建 × 可追溯的科學知識</span><button class="text-button" id="sources-footer">查看 ${Object.keys(sources).length} 筆參考資料 ${icon("arrow-up-right")}</button></footer>
  </main>
  <dialog id="notes-dialog" aria-labelledby="dialog-title"><div class="dialog-top"><div><span class="eyebrow">THE RESEARCH NOTEBOOK</span><h2 id="dialog-title"></h2></div><button id="dialog-close" aria-label="關閉">${icon("x")}</button></div><div id="dialog-content"></div></dialog>
`;
}
