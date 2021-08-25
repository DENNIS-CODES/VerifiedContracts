import { By, Key, ThenableWebDriver, until, WebElement } from "selenium-webdriver";
import { Token } from "../types/token";
require('dotenv').config()

if (
    !process.env.MAX_PAGES
) {
    throw new Error(
        "MAX_PAGES, Must be defined in your .env FILE"
    );
}

const MAX_PAGES = parseInt(process.env.MAX_PAGES || '1')

const getVerifiedContracts = async (driver: ThenableWebDriver, page: number = 1, contracts: Token[] = []): Promise<Token[]> => {
    try {

        console.log(`Getting verified contracts on page ${page}`);

        await driver.get(`https://etherscan.io/contractsVerified/${page}`);

        const table = await driver.findElement(By.css('table'));

        const tbody = await table.findElement(By.css('tbody'))
        const tokens = await tbody.findElements(By.css('tr'))

        for (let index = 0; index < tokens.length; index++) {
            const token: WebElement = tokens[index];

            let rowCells = await token.findElements(By.css('td'))

            contracts.push({
                address: await rowCells[0].findElement(By.css('a')).getAttribute('data-original-title'),
                name: await rowCells[1].getText(),
                compiler: await rowCells[2].getText(),
                version: await rowCells[3].getText(),
                balance: await rowCells[4].getText(),
                txns: await rowCells[5].getText(),
                setting: await rowCells[6].getText(),
                dateVerified: await rowCells[7].getText(),
                audited: await rowCells[8].getText(),
                licence: await rowCells[9].getText(),
            })

        }
        if (page < MAX_PAGES) {
            return getVerifiedContracts(driver, page + 1, contracts)
        }

    } catch (error) {
        console.log('Error:', error);

    }
    return contracts;

}

export { getVerifiedContracts }