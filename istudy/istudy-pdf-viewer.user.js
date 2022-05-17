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

function createPdfViewerObjectURL() {
  const styleString = `body{margin:0;background-color:rgb(82,86,89)}iframe{width:100%;height:100%;border:none}.mdc-fab{box-shadow:0 3px 5px -1px rgb(0 0 0/20%),0 6px 10px 0 rgb(0 0 0/14%),0 1px 18px 0 rgb(0 0 0/12%);display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:56px;height:56px;position:absolute;right:16px;bottom:16px;border-radius:16px;background-color:rgb(50,54,57)}.mdc-fab:before{background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24' width='24' fill='%23FFF'%3E%3Cpath d='M0 0h24v24H0V0z' fill='none'/%3E%3Cpath d='M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z'/%3E%3C/svg%3E");content:"";width:24px;height:24px}`
  const pdfViewerHTML = `<style>${styleString}</style><iframe id="viewer"></iframe><a class="mdc-fab" id="fab-button" target="_blank"></a>`
  const pdfViewerBlob = new Blob([pdfViewerHTML], { type: "text/html" })
  return URL.createObjectURL(pdfViewerBlob)
}

// `handler` will be executed `timeout` ms after the previous run was completed
function setSynchronizedInterval(handler, timeout) {
  setTimeout(() => {
    try {
      handler()
    } finally {
      setSynchronizedInterval(handler, timeout)
    }
  }, timeout)
}

async function fetchAndEmbedPdf(responsePromise, documentRef) {
  const pdfResponse = await responsePromise
  const pdfBlob = await pdfResponse.blob()
  const pdfObjectURL = URL.createObjectURL(pdfBlob)

  // After fetching completed, the current property should in theory hold a reference of the pdf viewer's document object
  // As loading it should be almost instant
  const { current: documentToEmbedPdf } = documentRef

  // Prevent a rare race condition,
  // where the user navigate to a different course material before fetching of the old one was completed
  // `documentToDisplayPdf` will be null as the referenced document will have already been detached and destroyed
  if (documentToEmbedPdf === null) return

  documentToEmbedPdf.getElementById("viewer").src = pdfObjectURL
  documentToEmbedPdf.getElementById("fab-button").href = pdfObjectURL
}

const pdfViewerEl = document.getElementById("s_main")
const pdfViewerObjectURL = createPdfViewerObjectURL()

// Avoid sending duplicate requests for the same PDF file
setSynchronizedInterval(() => {
  // `pdfViewerEl.contentDocument` will be null if the course material is served from a different domain
  if (pdfViewerEl.contentDocument?.title !== "PDF.js viewer") return

  const pdfURL = `https://istudy.ntut.edu.tw/learn/path/${
    pdfViewerEl.contentDocument.head.innerHTML.match(/getPDF\.php\?id=[^'"`]+/)[0]
  }`
  const referrer = pdfViewerEl.contentWindow.location.href
  const documentRef = { current: pdfViewerEl.contentDocument } // Default value

  pdfViewerEl.src = pdfViewerObjectURL
  // Keep a reference of the current document object
  pdfViewerEl.addEventListener("load", () => (documentRef.current = pdfViewerEl.contentDocument), { once: true })

  // The following code run asynchronously
  fetchAndEmbedPdf(fetch(pdfURL, { referrer, credentials: "include" }), documentRef)
}, 10)
