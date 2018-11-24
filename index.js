const puppeteer = require('puppeteer');

(async() => {
    const browser = await puppeteer.launch({
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ]
});
const page = await browser.newPage();
const newPagePromise = new Promise(resolve => browser.once('targetcreated', target => resolve(target.page())));

await page.goto('https://employment.en-japan.com/search/search_list/?occupation=101000_101500_102000_102500_103000_103500_104000_104500_105000_105500_109000&pagenum=1&aroute=0&arearoute=1&caroute=0101');

const toDescButtonSelector = '.list:nth-child(1) > .jobSearchListUnit > .unitBase > .buttonArea > .toDesc';
await page.waitForSelector(toDescButtonSelector);
const button = await page.$(toDescButtonSelector);
await button.click();

let newPage = await newPagePromise;

const dataTableRowSelector = '.contents > .dataTable > tbody > tr';
await newPage.waitForSelector(dataTableRowSelector);
const tableData = await newPage.evaluate((selector) => {
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
console.log(tableData);

await newPage.close();
browser.close();
})();