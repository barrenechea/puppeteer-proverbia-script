import puppeteer, { Browser, Page, type PuppeteerLaunchOptions } from 'puppeteer';

type ProverbiaQuote = {
  text: string;
  author: string;
};

class ProverbiaDriver {
  private browser?: Browser;
  private page?: Page;
  public fullName?: string;

  public async init() {
    const launchArgs: PuppeteerLaunchOptions = { headless: true };

    if (process.env.CHROMIUM_PATH) {
      launchArgs.executablePath = process.env.CHROMIUM_PATH as string;
      launchArgs.args = ['--no-sandbox', '--window-size=1366,768'];
    }

    this.browser = await puppeteer.launch(launchArgs);
    this.page = await this.browser.newPage();
    this.page?.setViewport({ width: 1366, height: 768 });
  }

  public async close() {
    await this.page?.close();
    await this.browser?.close();
  }

  public async getProverbia(): Promise<ProverbiaQuote[]> {
    if (!this.browser || !this.page) await this.init();

    try {
      await this.page?.goto('https://proverbia.net/', { waitUntil: 'domcontentloaded' });

      const mappedQuotes = await this.page?.evaluate(() => {
        const returnValue: ProverbiaQuote[] = [];
        /** In this array you'll have all quotes available on the landing site (not just the daily one) */
        const quotes = document.getElementsByClassName('bsquote');

        for (let itemIdx = 0; itemIdx < quotes.length; itemIdx++) {
          const text = (document.getElementsByClassName('bsquote').item(itemIdx)?.children.item(0) as HTMLElement)?.innerText;
          const author = (document.getElementsByClassName('bsquote').item(itemIdx)?.children.item(1) as HTMLElement)?.innerText;

          if (text && author) {
            returnValue.push({ text, author });
          }
        }

        return returnValue;
      });

      return mappedQuotes || [];
    }
    catch (e) {
      console.log(e);
      return [];
    }
  }
}

const proverbiaDriver = new ProverbiaDriver();
export default proverbiaDriver;
