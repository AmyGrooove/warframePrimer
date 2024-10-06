import axios from "axios";
import { CheerioAPI, load } from "cheerio";

type TResource = Record<string, number>;

const getMaterial = (parsedPage: CheerioAPI) => {
  const materialRow = parsedPage("tr").filter((_, element) =>
    parsedPage(element).text().includes("Материалы для"),
  );

  const materials: TResource = {};

  if (!materialRow.length) return null;

  const nextRow = materialRow.next("tr");
  nextRow.find("td").each((_, element) => {
    const img = parsedPage(element).find("img");
    const resourceName = img.attr("alt");
    const quantity = parsedPage(element).text().trim().replace(/\D/g, "");

    if (resourceName && quantity) materials[resourceName] = Number(quantity);
  });

  return materials;
};

const parseWeaponData = async (url: string, name: string) => {
  try {
    const { data } = await axios.get(url);

    const parsedPage = load(data);

    const imgElement = parsedPage("img.pi-image-thumbnail");
    const image = decodeURIComponent(imgElement.attr("src") || "");

    const materials = getMaterial(parsedPage);

    return { materials, url, name, image };
  } catch (error) {
    console.error("Ошибка при парсинге:", error);

    return null;
  }
};

export { parseWeaponData };
