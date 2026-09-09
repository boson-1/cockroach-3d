import {
  organs as americanOrgans,
  sources as americanSources,
  systems,
  systemById,
  requiredDepth as baseDepth,
} from "./data.js";
import { speciesSources } from "./species-sources.js";
export { systems, systemById };

// A source attached to a comparator is evidence about the comparator, not proof
// that every microscopic structure/count is identical in the displayed species.
export function createAtlasData(species) {
  const isAmerican = species.id === "american";
  const allSources = { ...americanSources, ...speciesSources };
  const records = americanOrgans
    .filter((o) => !(species.reducedWings && o.id === 2))
    .map((o) => ({
      ...o,
      refs: [...o.refs],
      evidence: isAmerican
        ? "美洲蟑螂解剖參考"
        : "比較解剖 · 參考物種：美洲蟑螂",
    }));
  const byId = new Map(records.map((o) => [o.id, o]));
  const override = (id, fields) =>
    Object.assign(byId.get(id), fields, {
      evidence: "本種資料 · 形態近似重建",
    });
  if (!isAmerican) {
    for (const o of records) {
      o.referenceDetail = o.detail;
      o.detail =
        "本圖的這個部位沿用美洲蟑螂比較解剖框架，用於理解器官的相對位置與一般功能；其形狀、分枝、數量及微細構造，尚未以本種標本逐一校準。";
      o.note =
        "下方「比較來源的詳細解說」保留原參考物種的知識。當中出現美洲蟑螂、P. americana 或數量時，不代表本頁物種的測量結果。";
    }
    override(22, {
      description: species.diagnostic,
      detail:
        "前胸背板位於頭部後上方。自然配色呈現本種的主要斑紋，斑塊邊界與深淺會因個體、光線及羽化後時間而變化。",
      note: species.sexNote,
      refs: [
        species.refs[0],
        ...species.refs.filter((id) => id.endsWith("Atlas")),
      ],
      referenceDetail: null,
    });
    override(1, {
      name: species.reducedWings ? "退化前翅" : "前翅（革翅）",
      description: species.sexNote,
      detail: species.reducedWings
        ? "前翅只保留胸部兩側的小型鱗片狀構造，不覆蓋腹背板。本種沒有後翅，因此操作中直接從前翅小片進入背板。"
        : "前翅由中胸長出。切換雌雄會更新翅長及身體寬度；翅脈為依外觀製作的近似紋理，尚未建立本種逐條翅脈命名與量測。",
      note: species.diagnostic,
      refs: [
        species.refs[0],
        ...species.refs.filter((id) => id.endsWith("Atlas")),
        ...(species.reducedWings ? ["harlequinGuide"] : []),
      ],
      referenceDetail: null,
    });
    override(48, {
      description:
        "分節的腹部背板構成腹部背側體壁。" +
        (species.reducedWings ? "本種成蟲腹背板外露，帶有不規則淡色斑。" : ""),
      detail:
        "掀開背板可進入內部。展示用的左右翻片不是活體的開合方式；斑紋和板片輪廓為近似重建。",
      note: species.diagnostic,
      refs: [
        species.reducedWings ? "harlequinGuide" : species.refs[0],
        ...species.refs.filter((id) => id.endsWith("Atlas")),
      ],
      referenceDetail: null,
    });
  }
  if (species.id === "australian") {
    override(1, {
      name: "前翅（革翅）",
      description:
        "前翅基部外側有一條淡黃至黃橙色縱紋，是與美洲蟑螂比較的主要線索。",
      detail:
        "縱紋沿兩片前翅外緣的近基部延伸，沒有繞著整片翅形成黃框。雌雄成蟲都有發達前翅；掀開後可觀察其下的後翅。模型翅脈是近似紋理，尚未逐脈校準。",
      note: "比較前胸背板時，也可見暗色中央與鮮明淡黃邊紋；色斑有個體差異。",
      refs: ["australianUF", "australianAtlas"],
      referenceDetail: null,
    });
    override(24, {
      description: "腹端的一對尾鬚較寬、末端較鈍，雌雄都有。",
      detail:
        "本頁依 UF 物種資料縮短尾鬚並增加相對寬度；關節、感覺毛密度及末節比例仍是形態近似。",
      note: "尾鬚不是腹刺。切換雄性後，腹端另可見較小的一對腹刺。",
      refs: ["australianGallery", "australianUF"],
      referenceDetail: null,
    });
    override(62, {
      description: "雄性腹端腹面具有一對較小的腹刺，雌性沒有。",
      detail:
        "UF/IFAS 的本種雄雌腹端照片分別標示尾鬚與腹刺；兩者的有無可協助判讀性別。模型保留雄性限定顯示，但端板與關節比例並未依標本量測。",
      note: "背面外觀與翅長的雌雄差異較小；轉到腹面觀察腹端更清楚。",
      refs: ["australianUF"],
      referenceDetail: null,
    });
  }
  if (species.id === "brown") {
    override(24, {
      description: "腹端一對短而較粗的尾鬚，是與美洲蟑螂比較時的重要線索。",
      detail:
        "本頁縮短尾鬚並增加其相對粗度；末節的長寬及肛上板輪廓，仍應用實際標本和分類檢索表確認。",
      note: "短粗是相對於美洲蟑螂的比較，不能單憑體色鑑定。",
      refs: ["brownUF", "brownCanada"],
      referenceDetail: null,
    });
    override(17, {
      description: "長觸角承載多種感器，接收周圍的化學與機械刺激。",
      detail:
        "本種成蟲的掃描電顯與觸角電位研究觀察到多類感覺毛，並報告雄性的嗅覺感器較多。模型呈現長分節觸角，並未逐類重建這些感器。",
      note: "可比較感覺器官的位置；不能從這個模型計算實際感器密度。",
      refs: ["brownAntenna"],
      referenceDetail: null,
    });
  }
  if (species.id === "german") {
    for (const id of [15, 59])
      override(id, {
        description:
          id === 15
            ? "一對卵巢各由約 20 條卵巢管組成。"
            : "約 20 條卵巢管在每側卵巢內排列，每條主要由最基部的卵母細胞在該週期成熟。",
        detail:
          "德國蟑螂具有無滋養細胞型卵巢。模型依本種研究改為每側 20 條，以近似的前後排列表示發育序列；大小、發育階段與個體數量會變動。",
        note: "約 20 條是文獻中的典型數量，不是所有個體恆定不變的值。未將美洲蟑螂每側 8 條的模型直接套用。",
        refs: ["germanOvary"],
        referenceDetail: null,
      });
    records.push({
      id: 66,
      name: "雄性求偶背腺",
      en: "Male tergal glands",
      system: "reproductive",
      sex: "male",
      depth: 2,
      location: "第 7、8 腹背板",
      description: "雄性抬翅時露出的腺區，參與求偶互動。",
      detail:
        "本種研究描述第 7、8 腹背板的腺體與凹陷。模型在這兩節背板標示腺區位置，切換雄性才顯示。",
      note: "深色凹陷用於辨識表面區域；內部腺細胞、儲液腔及膜質感覺構造未完整重建。",
      evidence: "本種研究 · 腺區定位",
      refs: ["germanGland"],
    });
  }
  if (species.id === "brown-banded")
    records.push({
      id: 65,
      name: "雌性背板費洛蒙腺",
      en: "Female tergal pheromone glands",
      system: "reproductive",
      sex: "female",
      depth: 2,
      location: "第 4、5 腹背板側緣",
      description: "雌性背板的腺細胞與孔道參與性費洛蒙的產生及釋放。",
      detail:
        "行為、觸角電位與形態研究將主要腺區定位於第 4、5 腹背板，側緣孔道密度較高。模型以貼合背板的低隆起區提示位置。",
      note: "Supellapyrone 是本種已鑑定的性費洛蒙。腺區位置有本種證據，顯示面積、顏色及隆起程度為教學近似。",
      evidence: "本種研究 · 腺區定位",
      refs: ["bandedGland", "bandedPheromone"],
    });
  const organs = records.sort((a, b) => a.id - b.id);
  const organById = new Map(organs.map((o) => [o.id, o]));
  const used = new Set([
    ...organs.flatMap((o) => o.refs),
    ...species.refs,
    ...(["brown", "australian"].includes(species.id)
      ? ["blattinaeRevision"]
      : []),
  ]);
  // The American notebook keeps its complete baseline bibliography.
  const sources = isAmerican
    ? americanSources
    : Object.fromEntries(
        Object.entries(allSources).filter(([id]) => used.has(id)),
      );
  return {
    organs,
    organById,
    sources,
    getOrgans: (system, sex = "female") =>
      organs.filter((o) => o.system === system && (!o.sex || o.sex === sex)),
    requiredDepth: (o) => baseDepth(o),
  };
}
