import puppeteer from "puppeteer";
import { SCREENSHOT_TARGET_ID } from "./constants";

export const takeCodeImage = async (url: string) => {
  const browser = await puppeteer.launch({
    headless: "shell",
  });

  const page = await browser.newPage();

  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2,
  });
  await page.goto(url);

  await page.waitForSelector(`#${SCREENSHOT_TARGET_ID}`);

  let elemHandle = await page.$(`#${SCREENSHOT_TARGET_ID}`);

  if (!elemHandle) {
    elemHandle = await page.$("pre");
  }

  if (!elemHandle) {
    throw new Error("No pre element found");
  }

  const image = await elemHandle.screenshot();

  return image;
};
