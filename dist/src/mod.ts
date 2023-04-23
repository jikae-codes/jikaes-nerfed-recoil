import { DependencyContainer } from "tsyringe";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";
import { LogBackgroundColor } from "@spt-aki/models/spt/logging/LogBackgroundColor";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";


// spaghetti code for your pleasure




class Mod implements IPostDBLoadMod, IPreAkiLoadMod
{

    public config = require('../config/config.json');


    public preAkiLoad(container: DependencyContainer): void {
        const logger = container.resolve<ILogger>("WinstonLogger");
        logger.info("Loaded: ReduceCarbineRecoil - By jikae.org - Version: 1.0.0");
    }


    public postDBLoad(container: DependencyContainer): void 
    {
        // get database from server
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const logger = container.resolve<ILogger>("WinstonLogger");
        const tables = databaseServer.getTables();
        
        // Find the guns by their Id
        const weapons = [];
        const assault_carbines = [ // ignore this, this was from a few days ago when i didn't know anything
            tables.templates.items["5c07c60e0db834002330051f"],
            tables.templates.items["5d43021ca4b9362eab4b5e25"],
            tables.templates.items["5f2a9575926fd9352339381f"],
            tables.templates.items["5c501a4d2e221602b412b540"],
            tables.templates.items["59e6152586f77473dc057aa1"],
            tables.templates.items["59e6687d86f77411d949b251"],
            tables.templates.items["628b5638ad252a16da6dd245"],
            tables.templates.items["628b9c37a733087d0d7fe84b"],
            tables.templates.items["587e02ff24597743df3deaeb"],
            tables.templates.items["574d967124597745970e7c94"]
        ];


        const items = tables.templates.items;
        for (const item in items) {
            if (items[item]._parent === "5422acb9af1c889c16000029") {
                logger.info(`Found new Weapon Category: ${items[item]._id}`);
                for (const weapon in items) {
                    if (items[weapon]._parent === items[item]._id) {
                        logger.info(`Found new Gun: ${items[weapon]._id} + ${items[weapon]._name}`);
                        weapons.push(items[weapon]._id);
                    }
                }
            }
        }


        for (const wep in weapons) {
            for (const item in items) { // nested loop LMAO
                if (items[item]._id === weapons[wep]) { // checking if it's the right weapon ;)
                    logger.info(`ID: ${items[item]._id}`);
                    items[item]._props.CameraRecoil -= this.config.recoil_nerf_amount; // decreasing camrecoil
                    items[item]._props.RecoilForceUp -= this.config.recoil_nerf_amount; // decreasing gunrecoil
                }
            }
        }



        for (const carbine of assault_carbines) {
            carbine._props.CameraRecoil = 0.02;
        }



        // Ignore dis
        // get globals settings and set flea market min level to be 1
        //tables.globals.config.RagFair.minUserLevel = 1;
    }
}

module.exports = { mod: new Mod() }