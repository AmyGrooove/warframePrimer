import axios from "axios";
import { CheerioAPI, load } from "cheerio";

type TResource = Record<string, number>;

const getDataFromTable = (
  parsedPage: CheerioAPI,
  filterText = "Материалы для",
  multiple = 1,
) => {
  const materialRow = parsedPage("table.template")
    .find("tr")
    .filter((_, element) => parsedPage(element).text().includes(filterText));

  if (!materialRow.length) return null;

  const materials: TResource = {};

  materialRow
    .next("tr")
    .find("td")
    .each((_, element) => {
      const img = parsedPage(element).find("img");
      const resourceName = img.attr("alt");
      const quantity = parsedPage(element).text().trim().replace(/\D/g, "");

      if (resourceName && quantity)
        materials[resourceName] = Number(quantity) * multiple;
    });

  return materials;
};

const getMaterial = (parsedPage: CheerioAPI) => {
  const materials = getDataFromTable(parsedPage);
  if (!materials) return null;

  if (parsedPage("table.template").find("tr").length > 4) {
    const mergedData: Record<string, number> = {};

    Object.keys(materials)
      .map((item) => getDataFromTable(parsedPage, item, materials[item]))
      .filter((item) => !!item)
      .concat([materials])
      .forEach((item) => {
        Object.keys(item).forEach((key) => {
          if (key === "Очки Синдиката") return;

          mergedData[key] = (mergedData[key] || 0) + item[key];
        });
      });

    return mergedData;
  } else return materials;
};

const parseWeaponData = async (url: string, name: string) => {
  const { data } = await axios.get(url);

  const parsedPage = load(data);

  const imgElement = parsedPage("img.pi-image-thumbnail");
  const image = decodeURIComponent(imgElement.attr("src") || "");

  const materials = getMaterial(parsedPage);

  return { materials, url, name, image };
};

export { parseWeaponData };
