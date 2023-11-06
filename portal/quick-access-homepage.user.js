// ==UserScript==
// @name        [NTUT Portal] "Quick Access" homepage
// @namespace   Violentmonkey Scripts
// @match       https://nportal.ntut.edu.tw/myPortal.do*
// @grant       none
// @run-at      document-end
// @version     1.0
// @author      Loh Ka Hong
// @description Quickly navigate to various school portal systems from the homepage
// @homepage    https://github.com/mon-jai/ntut-violentmonkey-scripts
// ==/UserScript==

"use strict"

const appLinkSelector = "span[onclick^=ssoLogAdd]"

const customStylesHTML = html`<style>
  * {
    box-sizing: border-box;
  }

  #header {
    background-size: cover;

    .headerLogo {
      width: 100%;
      height: 100%;
      z-index: 1;
    }

    .navigation ul {
      z-index: 2;
    }
  }

  #floatingBoxParentContainer > center {
    padding: 8px;

    > .eipInfoMainWithBorder {
      margin: 0;
      display: flex;
      flex-direction: column;
    }
  }

  #divAptreeSso {
    overflow: auto !important;
  }

  .eipTable2 > tbody {
    display: grid;
    grid-auto-columns: 1fr;

    > tr {
      min-width: 250px;
      padding: 0.75rem 0;

      &:not(:last-child):not(:nth-last-child(2)) {
        border-right: 1px solid #cccccc;
      }

      /* 人事系統 尚無資料 */
      &:has(+ tr .eipAlert),
      &:has(.eipAlert) {
        display: none !important;
      }

      /* APP 市集 */
      &:has(+ tr span[onclick*="market_appView_copy"]),
      &:has(span[onclick*="market_appView_copy"]) {
        display: none !important;
      }
    }

    > tr.eipItem {
      grid-row: 1;
      display: flex;
      justify-content: center;
      align-items: center;

      > td {
        /* English UI */
        text-align: center;

        > img[src="template/ntut/arrow_down.gif"] {
          display: none;
        }
      }
    }

    > tr.eipItem + tr > td > table > tbody {
      &,
      & > tr.eipData {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      > tr.eipData {
        padding-right: 0.75rem;

        > td {
          width: 100%;
          display: flex;

          &:not(:has(a)) {
            display: none;
          }

          > img {
            &[src="images/tree/point.gif"] {
              height: calc(1rem * 1.5);
            }

            &[src="images/tree/ap.png"] {
              display: none;
            }
          }

          > span {
            font-size: 1rem;
            line-height: 1.5;
          }
        }
      }
    }
  }
</style>`

function html(strings, ...values) {
  return String.raw({ raw: strings }, ...values)
}

function waitForSelector(selector) {
  return new Promise(resolve => {
    new MutationObserver((_, observer) => {
      const elements = document.querySelectorAll(selector)

      if (elements.length == 0) return

      observer.disconnect()
      resolve(elements)
    }).observe(document.body, { childList: true, subtree: true })
  })
}

const original_aptreeMain = aptreeMain
aptreeMain = async () => {
  original_aptreeMain()

  const apLinks = await waitForSelector(appLinkSelector)

  for (const apLink of apLinks) {
    // https://stackoverflow.com/a/16820058
    // Skip the element if it is a alternative server link
    if (!document.body.contains(apLink)) continue

    // Make text break with line
    apLink.innerHTML = apLink.innerHTML.replaceAll("&nbsp;", " ")

    // Alternative: apLink.innerText.replaceAll(" ", "\xa0").replace(/（Link\s\d）/, "")
    const appName = apLink
      .getAttribute("onclick")
      .match(/['"]([^'"]+)['"]\)$/)[1]
      .replace(/（Link\s\d）/, "")
    const alternativeServerEls = [...document.querySelectorAll(`${appLinkSelector}[onclick*="${appName}"]`)].filter(
      el => el !== apLink,
    )

    if (alternativeServerEls.length == 0) continue

    // Display alternative server links alongside primary server
    apLink.innerHTML =
      html`
        <a target="_blank" href=${apLink.children[0].href}>${appName.replaceAll(/\s/g, " ")}</a>
        <br />
      ` +
      alternativeServerEls
        .map((alternativeServerEl, index) => {
          const href = alternativeServerEl.children[0].href
          const innerText = "[" + (index + 2).toLocaleString("zh-Hans-CN-u-nu-hanidec") + "機]"
          return html`<a href="${href}" target="_blank">${innerText}</a>`
        })
        .join("&nbsp;")

    for (const alternativeServerEl of alternativeServerEls) alternativeServerEl.remove()
  }
}

toIndex = aptreeMain
aptreeMain()

document.body.insertAdjacentHTML("beforeend", customStylesHTML)
waitForSelector("a[href*='toIndex']").then(([element]) => element.remove())
waitForSelector("a[href*='aptreeMain']").then(([element]) => element.remove())
