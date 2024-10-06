import axios from "axios";
import { load } from "cheerio";
import { wikiURL } from "../static/wikiURL.js";

interface IWeaponLinkData {
  name: string;
  link: string;
}

const parseWeaponsList = async (url: string) => {
  try {
    const { data } = await axios.get(url);

    const parsedPage = load(data);

    const table = parsedPage("table");
    if (!table.length) {
      console.log("Таблица не найдена.");
      return null;
    }

    const weapons: IWeaponLinkData[] = [];
    table.find("td").each((_, element) => {
      const span = parsedPage(element).find("span");
      const anchor = span.find("a");
      const weaponName = span.attr("data-param");
      const weaponLink = anchor.attr("href");

      if (weaponName && weaponLink) {
        const decodedLink = decodeURIComponent(weaponLink);
        weapons.push({ name: weaponName, link: wikiURL + decodedLink });
      }
    });

    return weapons;
  } catch (error) {
    console.error("Ошибка при парсинге:", error);
  }
};

export { parseWeaponsList };
