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

{
  const pdfViewer = document.getElementById("s_main")

  pdfViewer.addEventListener("load", async () => {
    if (pdfViewer.contentWindow.location.pathname !== "/learn/path/viewPDF.php") return

    pdfViewer.contentDocument.body.insertAdjacentHTML("beforeend", "<style>#outerContainer{display:none}<style>")

    const pdfURL = pdfViewer.contentDocument.head?.innerHTML.match(/"(getPDF.php\?id=.*)"/)[1]

    const styleString = `html,body{height:100%}body{margin:0;font-size:0;background-color:rgb(82,86,89)}body>*:not(iframe):not(.mdc-fab){display:none}iframe{border:none;height:100%;width:100%}.mdc-fab{align-items:center;background-color:#323639;border:none;border-radius:16px;bottom:16px;box-shadow:0 3px 5px -1px rgba(0,0,0,.2),0 6px 10px 0 rgba(0,0,0,.14),0 1px 18px 0 rgba(0,0,0,.12);box-sizing:border-box;color:#fff;cursor:pointer;display:inline-flex;height:56px;justify-content:center;padding:0;position:absolute;right:16px;text-decoration:none;user-select:none;width:56px}.mdc-fab:before{background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24' width='24' fill='%23FFF'%3E%3Cpath d='M0 0h24v24H0V0z' fill='none'/%3E%3Cpath d='M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z'/%3E%3C/svg%3E");content:"";height:24px;width:24px}`
    const pdfViewerHTML = `<style>${styleString}</style><iframe src="https://istudy.ntut.edu.tw/learn/path/${pdfURL}"></iframe><a class="mdc-fab" href="${pdfURL}" target="_blank"></a>`

    pdfViewer.contentDocument.documentElement.innerHTML = pdfViewerHTML
    console.log(pdfViewer.contentDocument.documentElement.innerHTML)
  })
}
