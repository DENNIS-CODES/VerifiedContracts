import { connect } from "mongoose";
import { schedule } from 'node-cron';
import { Profile, Token, TokenDoc, User } from "./models";
import { getVerifiedContracts } from "./scrapper"
import { Token as TokenAttrs } from "./types/token";
import { Builder } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";
import { getRandom } from 'random-useragent';
require('dotenv').config();
require('chromedriver')
if (
    !process.env.BSCSCAN_API_KEY &&
    !process.env.DB_URL &&
    !process.env.SCAN_INTERVAL_IN_MINS
) {
    throw new Error(
        "BSCSCAN_API_KEY && BSCSCAN_API_KEY && SCAN_INTERVAL_IN_MINS, Must be defined in your .env FILE"
    );
}
const SCAN_INTERVAL_IN_MINS = process.env.SCAN_INTERVAL_IN_MINS!


const App = async () => {
    console.log("********************************")
    console.log('Connecting to MongoDb...\n---');
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        keepAlive: true,
        connectTimeoutMS: 60000,
        socketTimeoutMS: 60000,
    }

    await connect(process.env.DB_URL!, options).then((result) => {
        console.log("Connected to MongoDb 😊:)");
    }).catch(async (err) => {
        let error = JSON.parse(JSON.stringify(err))
        console.log(`Mongo Error: ${error?.name} 😬`);

    });
    console.log('********************************');


    schedule(`*/${SCAN_INTERVAL_IN_MINS} * * * *`, async () => {
        console.log('Triggerd...');
        console.log(`Scraping verified contracts every ${SCAN_INTERVAL_IN_MINS} minutes ${new Date().toUTCString()}...`);
        let options: Options = new Options()
        options.addArguments(...['headless', 'no-sandbox', 'disable-gpu', 'disable-dev-shm-usage', `user-agent=${getRandom()}`])
        options.excludeSwitches(...['enable-automation', 'enable-logging'])
        // options.addExtensions(...[{ 'useAutomationExtension': false }])
        let driver = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build()
        try {
            await getVerifiedContracts(driver, 1).then(async (contracts: TokenAttrs[]) => {
                console.log(`Done, saving ${contracts.length} scrapped contracts to db...`);
                contracts.reverse()
                for (let index = 0; index < contracts.length; index++) {
                    const contract: TokenAttrs = contracts[index];
                    await Token.build(contract).save().catch((err) => {
                        let error = JSON.parse(JSON.stringify(err))
                        // console.log(`Error => { name: ${error?.name}, code: ${error?.code}, reason: ${error.code == '11000' ? 'Duplicate record' : undefined} }`)
                    });
                };

            }).catch((err) => {
                console.log('Error:', err);

            });
            console.log(`Contracts have been saved successfully ${new Date().toUTCString()}.`);
        }
        catch (error) {
            console.log('Error:', error);

        }
        finally {
            // close the driver
            await driver.quit();
        }
    })
}

App();