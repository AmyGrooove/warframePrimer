import axios from "axios";
import { load } from "cheerio";
import { wikiURL } from "../static/wikiURL.js";

interface IWeaponLinkData {
  name: string;
  link: string;
}

const parseWeaponsList = async (url: string) => {
  const { data } = await axios.get(url);

  const weapons: IWeaponLinkData[] = [];
  const parsedPage = load(data);
  parsedPage("div.wds-tab__content")
    .slice(0, 4)
    .find("tr")
    .filter((_, row) => {
      const thText = parsedPage(row).find("th").text().trim();

      return thText !== "Специальное" && thText !== "Китган";
    })
    .find("span")
    .each((_, element) => {
      const span = parsedPage(element);
      const anchor = span.find("a");
      const weaponName = span.attr("data-param");
      const weaponLink = anchor.attr("href");

      if (weaponName && weaponLink) {
        const decodedLink = decodeURIComponent(weaponLink);
        weapons.push({ name: weaponName, link: wikiURL + decodedLink });
      }
    });

  return weapons;
};

export { parseWeaponsList };
