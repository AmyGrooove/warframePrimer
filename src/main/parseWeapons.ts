import { weaponTypes } from "../static/weaponTypes.js";
import { parseWeaponData } from "../sub/parseWeaponData.js";
import { parseWeaponsList } from "../sub/parseWeaponsList.js";
import fs from "fs";

const parseWeapons = async () => {
  console.time("END. Script execution time");

  const fullWeaponsData: any = [];

  for (const weaponType of weaponTypes) {
    const weaponList = await parseWeaponsList(weaponType);

    if (!weaponList) continue;

    Promise.all(
      weaponList.map(async (weapon) => {
        const weaponData = await parseWeaponData(weapon.link, weapon.name);

        if (weaponData) fullWeaponsData.push(weaponData);
      }),
    );
  }

  fs.writeFileSync(
    "weaponsData.json",
    JSON.stringify(fullWeaponsData, null, 2),
  );

  console.timeEnd("END. Script execution time");
  process.exit();
};

parseWeapons();
