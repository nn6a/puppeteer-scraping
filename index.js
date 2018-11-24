const puppeteer = require('puppeteer');

(async() => {
    const browser = await puppeteer.launch({
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ]
});
const page = await browser.newPage();

await page.goto('https://employment.en-japan.com/search/search_list/?occupation=101000_101500_102000_102500_103000_103500_104000_104500_105000_105500_109000&pagenum=1&aroute=0&arearoute=1&caroute=0101');

const TO_DESC_BUTTON_SELECTOR = '.list:nth-child(INDEX) > .jobSearchListUnit > .unitBase > .buttonArea > .toDesc';
const JOB_DESC_PER_PAGE = 50;
for (let i = 1; i <= JOB_DESC_PER_PAGE; i++) {
    let toDescButtonSelector = TO_DESC_BUTTON_SELECTOR.replace('INDEX', i);
    await page.waitForSelector(toDescButtonSelector);
    let button = await page.$(toDescButtonSelector);
    await button.click();

    let newPage = await new Promise(resolve => browser.once('targetcreated', target => resolve(target.page())));

    const dataTableRowSelector = '.contents > .dataTable > tbody > tr';
    await newPage.waitForSelector(dataTableRowSelector);
    let tableData = await newPage.evaluate((selector) => {
        const data = {};
        const nodeList = document.querySelectorAll(selector);
        nodeList.forEach(_node => {
            const text = _node.innerText;
            const separatedText = text.split('\t');
            const key = separatedText[0];
            data[key] = separatedText[1];
        });

        return data
    }, dataTableRowSelector);
    console.log(`
    =======================================================================================
    == RESULT ${i}
    =======================================================================================
    `, tableData);

    await newPage.close();
    await page.waitFor(10000);
}

browser.close();
})();