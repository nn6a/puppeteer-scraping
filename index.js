const fs = require('fs');
const puppeteer = require('puppeteer');

async function run() {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
const page = await browser.newPage();

await page.goto('https://employment.en-japan.com/search/search_list/?occupation=101000_101500_102000_102500_103000_103500_104000_104500_105000_105500_109000&pagenum=1&aroute=0&arearoute=1&caroute=0101');

const SEARCH_URL = 'https://employment.en-japan.com/search/search_list/?occupation=101000_101500_102000_102500_103000_103500_104000_104500_105000_105500_109000&pagenum=PAGE_NUM&aroute=0&arearoute=1&caroute=0101';
const TO_DESC_BUTTON_SELECTOR = '.list:nth-child(INDEX) > .jobSearchListUnit > .unitBase > .buttonArea > .toDesc';
const DATA_TABLE_ROW_SELECTOR = '.contents > .dataTable > tbody > tr';

const outputData = [];
const ALL_JOB_NUM = await getAllJobNum(page);
const JOB_NUM_PER_PAGE = 50;
const ALL_PAGE_NUM = Math.ceil(ALL_JOB_NUM / JOB_NUM_PER_PAGE);

// 検索結果の全ページをループ
for (let i = 1; i <= ALL_PAGE_NUM; i++) {
    let searchUrl = SEARCH_URL.replace('PAGE_NUM', i);
    await page.goto(searchUrl);

    // ページ内の全ての求人をループ
    for (let i = 1; i <= JOB_NUM_PER_PAGE; i++) {
        let toDescButtonSelector = TO_DESC_BUTTON_SELECTOR.replace('INDEX', i);
        await page.waitForSelector(toDescButtonSelector);
        let button = await page.$(toDescButtonSelector);
        await button.click();

        let newPage = await new Promise(resolve => browser.once('targetcreated', target => resolve(target.page())));

        await newPage.waitForSelector(DATA_TABLE_ROW_SELECTOR);
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
        }, DATA_TABLE_ROW_SELECTOR);
        console.log(`
        =======================================================================================
        == RESULT ${i}
        =======================================================================================
        `, tableData);
        outputData.push(tableData);

        await newPage.close();
        await page.waitFor(10000);
    }
}

browser.close();

writeData(outputData);
}

async function getAllJobNum (page) {
    const ALL_JOB_NUM_SELECTOR = '.pageSet > .jobSearchListBase > #jobSearchListNum > .num > em';
    await page.waitForSelector(ALL_JOB_NUM_SELECTOR);

    const allJobNum = await page.evaluate((selector) => {
        const numText = document.querySelector(selector).innerHTML;
        return parseInt(numText, 10);
    }, ALL_JOB_NUM_SELECTOR);

    console.log(`
    =======================================================================================
    ==
    == 全 ${allJobNum} 件
    ==
    =======================================================================================
    `);

    return allJobNum;
}

function writeData (data) {
    const dest = fs.createWriteStream('data.json', 'utf8');
    dest.write(JSON.stringify(data, null, 4));
}

run();