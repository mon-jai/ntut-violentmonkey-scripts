// ==UserScript==
// @name        [iStudy] Change iStudy PDF viewer
// @namespace   Violentmonkey Scripts
// @match       https://istudy.ntut.edu.tw/learn/index.php
// @grant       none
// @version     1.0
// @author      Loh Ka Hong
// @description Display iStudy PDF files with browser's builtin PDf viewer
// @homepage    https://github.com/mon-jai/ntut-violentmonkey-scripts
// ==/UserScript==

"use strict"

function html([htmlText]) {
  return htmlText.trim()
}

const pdfViewerHtml = html`
  <style>
    body {
      margin: 0;
      background-color: rgb(82, 86, 89);
    }

    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    .mdc-fab {
      box-shadow: 0 3px 5px -1px rgb(0 0 0 / 20%), 0 6px 10px 0 rgb(0 0 0 / 14%), 0 1px 18px 0 rgb(0 0 0 / 12%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: 56px;
      height: 56px;
      transition: box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 15ms linear 30ms,
        transform 0.27s cubic-bezier(0, 0, 0.2, 1) 0ms;
      background-color: rgb(50, 54, 57);

      position: absolute;
      right: 16px;
      bottom: 16px;
      border-radius: 16px;
      overflow: hidden;
    }

    .mdc-fab:hover {
      box-shadow: 0 5px 5px -3px rgb(0 0 0 / 20%), 0 8px 10px 1px rgb(0 0 0 / 14%), 0 3px 14px 2px rgb(0 0 0 / 12%);
    }

    .mdc-fab:before {
      background-color: #fff;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      transition: opacity 15ms linear, background-color 15ms linear;
      z-index: 1;
      position: absolute;
      opacity: 0;
      content: "";
    }

    .mdc-fab:hover:before {
      opacity: 0.08;
    }

    .mdc-fab:after {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24' width='24' fill='%23FFF'%3E%3Cpath d='M5 21Q4.175 21 3.587 20.413Q3 19.825 3 19V5Q3 4.175 3.587 3.587Q4.175 3 5 3H11Q11.425 3 11.713 3.287Q12 3.575 12 4Q12 4.425 11.713 4.712Q11.425 5 11 5H5Q5 5 5 5Q5 5 5 5V19Q5 19 5 19Q5 19 5 19H19Q19 19 19 19Q19 19 19 19V13Q19 12.575 19.288 12.287Q19.575 12 20 12Q20.425 12 20.712 12.287Q21 12.575 21 13V19Q21 19.825 20.413 20.413Q19.825 21 19 21ZM9 15Q8.725 14.725 8.725 14.3Q8.725 13.875 9 13.6L17.6 5H15Q14.575 5 14.288 4.712Q14 4.425 14 4Q14 3.575 14.288 3.287Q14.575 3 15 3H20Q20.425 3 20.712 3.287Q21 3.575 21 4V9Q21 9.425 20.712 9.712Q20.425 10 20 10Q19.575 10 19.288 9.712Q19 9.425 19 9V6.4L10.375 15.025Q10.1 15.3 9.7 15.3Q9.3 15.3 9 15Z'/%3E%3C/svg%3E");
      content: "";
      width: 24px;
      height: 24px;
    }

    .mdc-fab:not([href]) {
      display: none;
    }
  </style>
  <iframe id="viewer"></iframe>
  <a class="mdc-fab" id="fab-button" target="_blank"></a>
`

const pdfViewerEl = document.getElementById("s_main")
const pdfViewerObjectURL = URL.createObjectURL(new Blob([pdfViewerHtml], { type: "text/html" }))
let oldPdfPathname = ""

setInterval(() => {
  // `pdfViewerEl.contentDocument` will be null if the course material is served from a different domain
  if (pdfViewerEl.contentDocument?.title !== "PDF.js viewer") return

  const pdfPathname = pdfViewerEl.contentDocument.head.innerHTML.match(/getPDF\.php\?id=[^'"`]+/)[0]

  if (pdfPathname === oldPdfPathname) return
  oldPdfPathname = pdfPathname

  const pdfURL = `https://istudy.ntut.edu.tw/learn/path/${pdfPathname}`
  const referrer = pdfViewerEl.contentWindow.location.href
  const pdfFetchPromise = fetch(pdfURL, { referrer, credentials: "include" })

  pdfViewerEl.addEventListener(
    "load",
    async () => {
      const pdfResponse = await pdfFetchPromise
      const pdfBlob = await pdfResponse.blob()
      const pdfObjectURL = URL.createObjectURL(pdfBlob)

      pdfViewerEl.contentDocument.getElementById("viewer").src = pdfObjectURL
      pdfViewerEl.contentDocument.getElementById("fab-button").href = pdfObjectURL
    },
    { once: true }
  )
  pdfViewerEl.src = pdfViewerObjectURL
}, 10)
