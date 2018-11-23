const puppeteer = require('puppeteer');

(async() => {
    const browser = await puppeteer.launch({
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ]
});
const page = await browser.newPage();
const navigationPromise = page.waitForNavigation();

await page.goto('https://employment.en-japan.com/desc_894920/?arearoute=1&aroute=0&caroute=0101');

await navigationPromise;

const tableData = await page.evaluate(() => {
    const data = {};
    const nodeList = document.querySelectorAll(".descArticleUnit.dataWork table.dataTable tbody tr");
    nodeList.forEach(_node => {
        const text = _node.innerText;
        const separatedText = text.split('\t');
        const key = separatedText[0];
        data[key] = separatedText[1];
    });

    return data
});
console.log(tableData);

browser.close();
})();