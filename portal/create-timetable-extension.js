// ==UserScript==
// @name        Timetable Extension Creator
// @namespace   Violentmonkey Scripts
// @match       https://aps.ntut.edu.tw/course/tw/Select.jsp?*
// @grant       none
// @run-at      document-end
// @require     https://cdn.jsdelivr.net/npm/@zip.js/zip.js@2.*/dist/zip.min.js
// @version     1.0
// @author      Loh Ka Hong
// @description Create timetable extension from https://aps.ntut.edu.tw/course/tw/Select.jsp?format=-2&code={(}student-id}&year={school-year}&sem={semester}
// @homepage    https://github.com/mon-jai/ntut-violentmonkey-scripts
// ==/UserScript==

function css([cssText]) {
  return cssText.trim()
}

const downloadButtonCSS = css`
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
    height: 56px;
    transition: box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 15ms linear 30ms,
      transform 0.27s cubic-bezier(0, 0, 0.2, 1) 0ms;
    background-color: #645f38;

    position: fixed;
    right: 16px;
    bottom: 16px;
    border-radius: 16px;
    overflow: hidden;

    padding: 16px;
    gap: 16px;
    color: white !important;
    text-decoration: none;
  }

  .mdc-fab:hover {
    box-shadow: 0 5px 5px -3px rgb(0 0 0 / 20%), 0 8px 10px 1px rgb(0 0 0 / 14%), 0 3px 14px 2px rgb(0 0 0 / 12%);
  }

  .mdc-fab:before {
    background-image: url("data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' height='24' width='24' fill='%23FFFFFF'%3E%3Cpath d='M6 20q-.825 0-1.412-.587Q4 18.825 4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413Q18.825 20 18 20Zm6-4-5-5 1.4-1.45 2.6 2.6V4h2v8.15l2.6-2.6L17 11Z'/%3E%3C/svg%3E");
    content: "";
    width: 24px;
    height: 24px;
  }

  .mdc-fab:after {
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

  .mdc-fab:hover:after {
    opacity: 0.08;
  }

  .mdc-fab:not([href]) {
    display: none;
  }
`

const timeTableCSS = css`
  body {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial,
      sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    background: none;
    display: flex;
    min-height: 100vh;
    margin: 0;
  }

  table {
    width: min(1200px, 100%);
    height: 1000px;
    max-height: 90vh;
    border: 0;
    border-collapse: collapse;
    margin: auto;
  }

  tr {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
  }

  tr:last-child {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }

  th,
  td {
    border: 0;
    color: rgba(0, 0, 0, 0.87);
    font-size: 1rem;
    white-space: nowrap;
  }

  th {
    font-weight: normal;
  }

  td {
    padding: 0;
  }

  td > a {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    color: rgba(0, 0, 0, 0.87);
    text-decoration: none;
  }

  td > a:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  td > a > br {
    display: none;
  }

  td > a > span {
    font-weight: bold;
  }
`

const manifestContent = {
  name: "選課表",
  version: "1",
  manifest_version: 3,
  chrome_url_overrides: { newtab: "timetable.html" },
}

function createTimetableHTML() {
  const documentCopy = new DOMParser().parseFromString(document.documentElement.outerHTML, "text/html")
  const detailsTrs = [...documentCopy.getElementsByTagName("table")[1].getElementsByTagName("tr")]

  for (const a of documentCopy.getElementsByTagName("table")[0].querySelectorAll("td > a:first-child")) {
    const td = a.parentNode
    const code = a.getAttribute("href").match(/code=([\dA-Z]+)/)[1]
    const href = [...detailsTrs.find(tr => tr.innerHTML.includes(`code=${code}`)).children]
      .find(td => td.innerHTML.includes("ShowSyllabus.jsp"))
      .getElementsByTagName("a")[0].href

    td.innerHTML = `<a href="${href}">${td.innerHTML
      .replace(/\<\s*a[^\>]*\>/g, "<span>")
      .replace(/\<\s*\/\s*a\s*\>/g, "</span>")}</a>`
  }
  documentCopy.getElementsByTagName("table")[0].getElementsByTagName("tr")[0].remove()

  documentCopy.head.innerHTML = ""
  for (const attribute of documentCopy.body.attributes) documentCopy.body.removeAttribute(attribute.name)

  const tableEl = documentCopy.getElementsByTagName("table")[0]
  for (const el of [...documentCopy.body.children]) if (el !== tableEl) el.remove()

  const style = documentCopy.createElement("style")
  style.innerHTML = timeTableCSS
  documentCopy.head.append(style)

  const meta = documentCopy.createElement("meta")
  meta.setAttribute("http-equiv", "Content-Type")
  meta.setAttribute("content", "charset=utf-8")
  documentCopy.head.append(meta)

  return `<!DOCTYPE html>${documentCopy.documentElement.outerHTML}`
}

const timetableHTML = createTimetableHTML()

const zipFileWriter = new window.zip.BlobWriter()
const zipWriter = new window.zip.ZipWriter(zipFileWriter)
;(async () => {
  await zipWriter.add("timetable.html", new window.zip.TextReader(timetableHTML))
  await zipWriter.add("manifest.json", new window.zip.TextReader(JSON.stringify(manifestContent, null, 2)))

  await zipWriter.close()
  const zipFileBlob = await zipFileWriter.getData()

  const downloadButtonStyle = document.createElement("style")
  downloadButtonStyle.innerText = downloadButtonCSS
  document.body.appendChild(downloadButtonStyle)

  const downloadButton = document.createElement("a")
  downloadButton.classList.add("mdc-fab")
  downloadButton.innerText = "下載課表擴充功能"
  document.body.appendChild(downloadButton)

  downloadButton.download = "timetable-extension.zip"
  downloadButton.href = URL.createObjectURL(zipFileBlob)
})()
