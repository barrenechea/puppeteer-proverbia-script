import puppeteer, { Browser, Page, type LaunchOptions } from "puppeteer";

type ProverbiaQuote = {
  text: string;
  author: string;
};

class ProverbiaDriver {
  private browser?: Browser;
  private page?: Page;
  public fullName?: string;

  private async checkAnonimity(): Promise<boolean> {
    if (!process.env.PROXY_SERVER) return false;

    try {
      await this.page?.goto("https://check.torproject.org/", {
        waitUntil: "domcontentloaded",
      });

      const isTorUsed = await this.page?.evaluate(() => {
        // Check for the message indicating Tor usage
        const successMessage = document.querySelector("h1");
        if (
          successMessage &&
          successMessage.textContent?.includes(
            "Congratulations. This browser is configured to use Tor."
          )
        ) {
          return true;
        }
        return false;
      });

      console.info(`Tor is being used: ${isTorUsed ? "Yes" : "No"}`);
      return !!isTorUsed;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  public async init() {
    const launchArgs: LaunchOptions = { headless: true };

    if (process.env.CHROMIUM_PATH) {
      launchArgs.executablePath = process.env.CHROMIUM_PATH as string;
      launchArgs.args = ["--no-sandbox", "--window-size=1366,768"];
    }

    if (process.env.PROXY_SERVER) {
      launchArgs.args = launchArgs.args
        ? launchArgs.args.concat([`--proxy-server=${process.env.PROXY_SERVER}`])
        : [`--proxy-server=${process.env.PROXY_SERVER}`];
    }

    this.browser = await puppeteer.launch(launchArgs);
    this.page = await this.browser.newPage();
    this.page?.setViewport({ width: 1366, height: 768 });
    await this.checkAnonimity();
  }

  public async close() {
    await this.page?.close();
    await this.browser?.close();
  }

  public async getQuoteOfTheDay(): Promise<ProverbiaQuote | null> {
    if (!this.browser || !this.page) await this.init();

    try {
      await this.page?.goto("https://proverbia.net/", {
        waitUntil: "networkidle0",
      });

      const quote = await this.page?.evaluate(() => {
        // Find the quote of the day in the new structure
        const quoteBlock = document.querySelector("blockquote.qotd-home");

        if (quoteBlock) {
          // Extract text from the <p> element inside blockquote
          const textElement = quoteBlock.querySelector("p");
          // Extract author from the <a> element inside footer
          const authorElement = quoteBlock.querySelector("footer a");

          const text = textElement?.textContent?.trim();
          const author = authorElement?.textContent?.trim();

          if (text && author) {
            return { text, author };
          }
        }

        return null;
      });

      return quote ?? null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

const proverbiaDriver = new ProverbiaDriver();
export default proverbiaDriver;
