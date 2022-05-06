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

async function fetchAndAttachPdf(responsePromise, documentRef) {
  const pdfResponse = await responsePromise
  const pdfBlob = await pdfResponse.blob()
  const pdfObjectURL = URL.createObjectURL(pdfBlob)

  const { current: documentToAttachPdf } = documentRef

  // Prevent a rare race condition,
  // where user navigate to a different course material before fetching of the old one was completed
  // `documentToDisplayPdf` will be null as the referenced document will have already been removed and destroyed
  if (documentToAttachPdf === null) return

  documentToAttachPdf.getElementById("viewer").src = pdfObjectURL
  documentToAttachPdf.getElementById("fab-button").href = pdfObjectURL
}

const pdfViewerEl = document.getElementById("s_main")

const cssString = `body{margin:0;background-color:rgb(82,86,89)}iframe{border:none;height:100%;width:100%}.mdc-fab{align-items:center;background-color:rgb(50,54,57);border:none;border-radius:16px;bottom:16px;box-shadow:0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12);box-sizing:border-box;color:#fff;cursor:pointer;display:inline-flex;height:56px;justify-content:center;padding:0;position:absolute;right:16px;text-decoration:none;user-select:none;width:56px}.mdc-fab:before{background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24' width='24' fill='%23FFF'%3E%3Cpath d='M0 0h24v24H0V0z' fill='none'/%3E%3Cpath d='M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z'/%3E%3C/svg%3E");content:"";height:24px;width:24px}`
const pdfViewerHTML = `<style>${cssString}</style><iframe id="viewer"></iframe><a class="mdc-fab" id="fab-button" target="_blank"></a>`
const pdfViewerBlob = new Blob([pdfViewerHTML], { type: "text/html" })
const pdfViewerObjectURL = URL.createObjectURL(pdfViewerBlob, { type: "text/html" })

// Avoid sending duplicate requests for the same PDF file
setSynchronizedInterval(() => {
  // `pdfViewerEl.contentDocument` will be null
  // If the course material is served from a different domain
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
  fetchAndAttachPdf(fetch(pdfURL, { referrer, credentials: "include" }), documentRef)
}, 10)
