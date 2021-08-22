import { connect } from "mongoose";
import { createProfile, getSourceCode } from "./contract"
import { schedule } from 'node-cron';
import { Profile, Token, TokenDoc, User } from "./models";
import { getVerifiedContracts } from "./scraper"
import { Token as TokenAttrs } from "./types/token";
import { Contract } from "./types/contract";
import { bot } from "./bot";
import { Builder } from "selenium-webdriver";
import { sendMessage } from "./helpers";
import { restart } from "./helpers";
import { Options } from "selenium-webdriver/chrome";
import { getRandom } from 'random-useragent';
import { GoogleSheet } from "./types/excel";
require('dotenv').config();
require('chromedriver')

const excel_file_path = './src/excel_templates/Verified-contracts.xlsx'

//exceljs package
const Excel = require('exceljs')

if (
    !process.env.ETHERSCAN_API_KEY &&
    !process.env.DB_URL &&
    !process.env.SCAN_INTERVAL_IN_MINS
) {
    throw new Error(
        "ETHERSCAN_API_KEY && ETHERSCAN_API_KEY && SCAN_INTERVAL_IN_MINS, Must be defined in your .env FILE"
    );
}
const SCAN_INTERVAL_IN_MINS = process.env.SCAN_INTERVAL_IN_MINS!


const App = async () => {
    try {
        bot.stop()
    }
    catch (err) { }

    console.log('********************************');
    console.log('Connecting to telegram bot...\n---');
    await bot.launch().then((result) => {
        console.log('Connected to telegram bot 😊:)');

    }).catch(async (err) => {
        let error = JSON.parse(JSON.stringify(err))
        console.log(`Telegram Error: ${error?.message} 😬`);
        await restart()

    }).catch((error: any) => {
        console.log(`Telegram Error: ${error?.message} 😬`);
    })
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
        await restart()

    });
    console.log('********************************');

    // connect to google sheet
    const gs = new GoogleSheet()
    await gs.setup()

    try {
        // Open a stream to the collection using watch
        let changeStream = Token.watch();
        let excelData = {}

        // set up a listener when change events are emitted
        changeStream.on("change", async (next: any) => {
            // process any change event
            if (next.operationType == 'insert') {
                //initiate token profiling

                const token: TokenDoc = next.fullDocument;

                console.log(`Getting token ${token.name} source code... 🔥`);
                const contract: Contract = await getSourceCode(token.address)
                console.log('---');
                console.log(`Profiling token ${token.name}... 👤 🛠`);
                const profile = await Profile.build(await createProfile(contract)).save()
                await Token.updateOne(
                    {
                        _id: token._id
                    },
                    {
                        $set: { profile: profile },
                        $currentDate: { updatedAt: true }
                    })
                console.log('---');
            }
            if (next.operationType == 'update') {
                if (Object.keys(next.updateDescription.updatedFields).includes('profile')) {
                    let token = await Token.findOne({ _id: next.documentKey._id })
                    let profile = token?.profile
                    // send tg message to all active with the token profile
                    let message = `*NEW TOKEN NOTIFICATION*\n---`
                    message += `\n*Contract Name:* ${token?.name}`
                    message += `\n*Contract Address:* [${token?.address.toUpperCase()}](https://etherscan.io/address/${token?.address}#code)`
                    message += `\n*Txns:* ${token?.txns}`
                    message += `\n*Date Verified:* ${token?.dateVerified?.toLocaleString().replace(', 12:00:00 AM', '')}`
                    message += `\n---`
                    message += `\n*Telegram:* ${profile?.telegram ? profile?.telegram.replace(',', '\n') : 'None'}`
                    message += `\n*Website:* ${profile?.website ? profile?.website.replace(',', '\n') : 'None'}`
                    message += `\n*Twitter:* ${profile?.twitter ? profile?.twitter.replace(',', '\n') : 'None'}`
                    message += `\n*Cooldown?:* ${profile?.cooldown ? 'Yes' : 'No'}`
                    message += `\n*Bots?:* ${profile?.bots ? 'Yes' : 'No'}`
                    message += `\n*Require Amount?:* ${profile?.require_amount ? 'Yes' : 'No'}`
                    message += `\n*Openzeppelin:* ${profile?.openzeppelin ? 'Yes' : 'No'}`
                    message += `\n---`
                    message += `\n*Add Liquidity Functions*`
                    for (let index = 0; index < profile!.liquidity_functions!.split(',').length; index++) {
                        const fxn = profile!.liquidity_functions!.split(',')[index];
                        message += `\n=> ${fxn?.trim() ? fxn?.trim() : 'None'}`

                    }
                    message += `\n---`
                    message += `\n*Sell Functions*`
                    for (let index = 0; index < profile!.sell_functions!.split(',').length; index++) {
                        const fxn = profile!.sell_functions!.split(',')[index];
                        message += `\n=> ${fxn?.trim() ? fxn?.trim() : 'None'}`

                    }
                    message += `\n---`
                    message += `\n*Buy Functions*`
                    for (let index = 0; index < profile!.buy_functions!.split(',').length; index++) {
                        const fxn = profile!.buy_functions!.split(',')[index];
                        message += `\n=> ${fxn?.trim() ? fxn?.trim() : 'None'}`

                    }
                    message += `\n---`

                    await sendMessage(await User.find({ is_active: true }), message)

                    await gs.insert_row([
                        '', // first empty col
                        token!.dateVerified.toISOString(), // date
                        token!.name, // token name
                        '', // token tracker
                        '', // liquidity listed
                        '', // expected date
                        '', //tg size
                        token?.profile?.telegram || '', // tg group
                        `https://etherscan.io/address/${token!.address}#code`, // token contract link
                        token?.profile?.website || '' // token website if any
                    ])
                }
            }

        });

    } catch (error) {
        console.log('Error:', error);
    }


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