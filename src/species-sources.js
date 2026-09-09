const atlasExcerpt = (species, scope) => ({
  title: `台灣常見室內節肢動物圖鑑 · ${species}節錄`,
  author: "李鍾旻、詹美鈴 · 聯經 · 2021 · ISBN 9789570860054",
  type: "使用者提供的圖鑑節錄",
  url: "https://store.linkingbooks.com.tw/product/141181",
  scope: `${scope} 依使用者於 2026-09-09 提供的頁面及照片核對；連結是出版社書目，不是節錄全文。照片僅用於比對，未嵌入網站。`,
});
export const speciesSources = {
  australianUF: {
    title: "Australian Cockroach · EENY623 / IN1088",
    author: "Shiyao Jiang & Phillip E. Kaufman · University of Florida / IFAS",
    type: "大學物種資料 · 成蟲與腹端照片",
    url: "https://ask.ifas.ufl.edu/publication/IN1088",
    scope:
      "成蟲約 32–35 mm；紅褐至深褐色、前翅外側基部淡黃縱紋、雌雄完整翅及腹端腹刺差異。並核對棲地與產卵鞘習性；未將發育時間或卵數視為固定值。",
  },
  australianTaxonomy: {
    title: "Validiblatta australasiae · current taxonomic combination",
    author: "Blattodea Working Group · Blattodea Species File",
    type: "分類學資料庫",
    url: "https://cockroach.speciesfile.org/otus/863239",
    scope:
      "現行有效名稱、Periplaneta australasiae 等歷史組合，及 2025 年分類修訂書目。2026-09-09 查核。",
  },
  australianGallery: {
    title: "Australian cockroach, Periplaneta australasiae",
    author: "University of Florida / IFAS · Cockroach species gallery",
    type: "大學物種資料",
    url: "https://entnemdept.ufl.edu/projex/gallery/dl/cockroaches/text/australian_cockroach.htm",
    scope:
      "紅褐至深褐體色、翅基黃紋、尾鬚寬而較鈍，雌雄具發達翅。用於外形比較，未推估本種內臟比例。",
  },
  australianAtlas: atlasExcerpt(
    "澳洲家蠊",
    "第 52 頁起的節錄：體長 27–35 mm、暗紅褐色、前胸背板鮮明淡黃邊紋、前翅基部外側黃橙縱紋與足部棘刺。成蟲與若蟲照片分開解讀。",
  ),
  germanAtlas: atlasExcerpt(
    "德國姬蠊",
    "黃褐色成蟲、前胸背板兩道平行暗縱紋、米白至黃褐色足，及雌雄體形差異。",
  ),
  brownAtlas: atlasExcerpt(
    "棕色家蠊",
    "深紅褐色光澤、模糊且有時近錨形的黃褐背板斑、均勻紅褐前翅和短粗尾鬚。圖鑑體長 25–35 mm；頁面標題另採 UF 的 33–38 mm，並非同一批樣本。",
  ),
  bandedAtlas: atlasExcerpt(
    "棕帶姬蠊",
    "雄成蟲黃褐色、翅基紅褐橫帶及前後淡區；雌成蟲較深色、腹寬翅短；若蟲有尤其明顯的兩條米白橫帶。外觀重建按雌雄與發育期區分。",
  ),
  harlequinAtlas: atlasExcerpt(
    "家屋斑蠊",
    "第 58–59 頁：黑色底、淡黃 M 形前緣與中央對稱斑；腹背板以側緣不規則斑為主、中央可無斑或有細淡橫斑。雌雄前翅縮小且無後翅，足淡黃而棘刺黑。",
  ),
  germanUF: {
    title: "German Cockroach, Blattella germanica · EENY-002",
    author: "S. Valles · University of Florida / IFAS",
    type: "大學物種資料",
    url: "https://ask.ifas.ufl.edu/publication/IN128",
    scope:
      "10–15 mm、前胸背板雙縱紋、雌雄體形及攜卵鞘習性；翅形依該頁成蟲照片作近似重建。",
  },
  germanOvary: {
    title:
      "Brownie, a Gene Involved in Building Complex Respiratory Devices in Insect Eggshells",
    author: "Irles, Bellés & Piulachs · PLOS ONE · 2009",
    type: "本種研究 · 卵巢與卵殼",
    url: "https://doi.org/10.1371/journal.pone.0008353",
    scope:
      "德國蟑螂每側卵巢約 20 條無滋養細胞型卵巢管；每繁殖週期主要為基部卵母細胞成熟。模型數量依此調整，細胞與卵殼並未重建。",
  },
  germanGland: {
    title:
      "Behavioral and Morphological Studies of the Membranous Tergal Structure of Male Blattella germanica During Courtship",
    author: "Journal of Insect Science · 2019",
    type: "本種研究 · 雄性背腺",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6804909/",
    scope:
      "雄性第 7、8 腹背板求偶腺及相關膜質構造。模型標示腺區和凹陷位置，不宣稱重現腺細胞微細結構。",
  },
  brownUF: {
    title: "Brown cockroach, Periplaneta brunnea",
    author: "T. R. Fasulo & R. W. Baldwin · UF/IFAS",
    type: "大學物種資料",
    url: "https://entnemdept.ufl.edu/projex/gallery/dl/Cockroaches/text/brown_cockroach.htm",
    scope:
      "成蟲約 33–38 mm、紅褐體色、短粗尾鬚、雌雄發達翅與環境偏好。此頁保留當時使用的舊學名。",
  },
  brownTaxonomy: {
    title: "Validiblatta brunnea · current taxonomic combination",
    author: "Blattodea Working Group · Blattodea Species File",
    type: "分類學資料庫",
    url: "https://cockroach.speciesfile.org/otus/863254",
    scope:
      "現行屬名及異名，收錄 Luo et al. 2025 的 Blattinae 分類修訂。2026-09-09 查核。",
  },
  blattinaeRevision: {
    title:
      "Revision of the cockroach subfamily Blattinae based on morphological and molecular analyses",
    author: "Luo et al. · Systematic Entomology 50: 836–854 · 2025",
    type: "同儕審查研究 · 分類修訂",
    url: "https://doi.org/10.1111/syen.12680",
    scope:
      "形態及分子分類修訂的背景；最終有效名稱另外以 Species File 的現行條目核對。",
  },
  brownCanada: {
    title:
      "The Insects and Arachnids of Canada, Part 14 · Periplaneta brunnea, p. 101",
    author: "Vickery & Kevan · Agriculture Canada · 1985",
    type: "政府分類專著",
    url: "https://publications.gc.ca/collections/collection_2016/aac-aafc/agrhist/A42-42-1985-14-eng.pdf",
    scope:
      "前胸背板不鮮明暗斑、全褐發達前翅與短尾鬚；雌雄肛上板鑑別。尺寸因樣本及測量方式異於 UF，不混成固定標準。歷史原產地敘述不採用。",
  },
  brownAntenna: {
    title:
      "External Appearance of Periplaneta brunnea Antennae and Their Electroantennogram Responses to Odorous Compounds",
    author: "Agricultural and Biological Chemistry 44(7): 1461 · 1980",
    type: "本種研究 · 電顯及觸角電位",
    url: "https://academic.oup.com/bbb/article/44/7/1461/5970701",
    scope:
      "核對公開摘要：雌雄成蟲觸角具多類感覺毛，雄性嗅覺感器較多。未按顯微照片逐一重建感器種類或密度。",
  },
  bandedUF: {
    title: "Brownbanded cockroach, Supella longipalpa",
    author: "T. R. Fasulo & R. W. Baldwin · UF/IFAS",
    type: "大學物種資料",
    url: "https://entnemdept.ufl.edu/projex/gallery/dl/cockroaches/text/brownbanded_cockroach.htm",
    scope:
      "約 13–14.5 mm、兩道淡褐翅帶；雌性較深且寬、翅短於腹部，雄性長翅；家具與高處藏身位置。",
  },
  bandedTaiEOL: {
    title: "Supella longipalpa · 長鬚帶蠊",
    author: "臺灣生命大百科",
    type: "臺灣物種名錄",
    url: "https://taieol.tw/pages/75736",
    scope: "核對長鬚帶蠊與棕帶蟑螂等俗名，以及頭、背板與翅基的外觀敘述。",
  },
  bandedGland: {
    title:
      "Site of Pheromone Production in Female Supella longipalpa: Behavioral, Electrophysiological, and Morphological Evidence",
    author:
      "Schal et al. · Annals of the Entomological Society of America 85: 605–611 · 1992",
    type: "本種研究 · 費洛蒙腺定位",
    url: "https://doi.org/10.1093/aesa/85.5.605",
    scope:
      "雌性第 4、5 腹背板、尤其側緣的表皮腺及孔道；模型標示腺區位置，孔洞與導管的微米尺度並未重建。",
  },
  bandedPheromone: {
    title:
      "Sex pheromone for the brownbanded cockroach is an unusual dialkyl-substituted alpha-pyrone",
    author: "Charlton et al. · PNAS 90: 10202–10205 · 1993",
    type: "本種研究 · 費洛蒙化學",
    url: "https://doi.org/10.1073/pnas.90.21.10202",
    scope:
      "雌性性費洛蒙 supellapyrone 的分離、鑑定及合成驗證；用於說明器官功能，不作幾何形狀依據。",
  },
  harlequinTaiEOL: {
    title: "Neostylopyga rhombifolia · 家屋斑蠊",
    author: "臺灣生命大百科",
    type: "臺灣物種名錄",
    url: "https://taieol.tw/pages/75774",
    scope:
      "家屋斑蠊與花斑蟑螂等中文名對應；使用其照片作外觀查核，照片未嵌入本站。",
  },
  harlequinGuide: {
    title: "台江昆蟲圖鑑 · 家屋斑蠊",
    author: "台江國家公園管理處",
    type: "政府自然觀察圖鑑",
    url: "https://ws.moi.gov.tw/001/Upload/415/ebook/ebook_180690/pdf/full.pdf",
    scope:
      "可檢索物種條目：體長約 20–30 mm、黑褐底及白／淺褐斑、前翅退化為小片、後翅完全退化。PDF 下載端回應不穩定，未聲稱已逐頁核對全書。",
  },
  harlequinRevision: {
    title:
      "New data on the genus Neostylopyga Shelford, 1911, with description of a new species from Laos",
    author: "L. N. Anisyutkin · Entomological Review 90: 871–876 · 2010",
    type: "分類研究 · 公開摘要",
    url: "https://doi.org/10.1134/S0013873810070055",
    scope:
      "摘要確認重新描述模式種 N. rhombifolia；未取得可核對的完整生殖器圖版，因此不據此繪製本種精細生殖器。",
  },
};
