// ==UserScript==
// @name        [NTUT Portal/iStudy] Autofill login page captcha
// @namespace   Violentmonkey Scripts
// @match       https://nportal.ntut.edu.tw/index.do
// @grant       none
// @require     https://unpkg.com/tesseract.js@^2/dist/tesseract.min.js
// @version     1.0
// @author      Loh Ka Hong
// @description Autofill captcha in NTUT service's login page
// @homepage    https://github.com/mon-jai/ntut-violentmonkey-scripts
// ==/UserScript==

"use strict"
;(async () => {
  function imgToBase64(img) {
    const c = document.createElement("canvas")
    c.width = img.width
    c.height = img.height
    c.getContext("2d").drawImage(img, 0, 0)
    return c.toDataURL()
  }

  function showPlaceHolder() {
    authCodeInput.value = ""
    authCodeInput.placeholder = "Recognizing code..."
  }

  async function recognizeCaptcha() {
    showPlaceHolder()
    const {
      data: { text: rawText },
    } = await worker.recognize(imgToBase64(authImage))
    const text = rawText.trim()

    if (text.trim().length === 4) {
      authCodeInput.placeholder = ""
      authCodeInput.value = text
    } else {
      changeAuthImage()
    }
  }

  const authCodeInput = document.getElementById("authcode")

  showPlaceHolder()

  const worker = window.Tesseract.createWorker()
  const authImage = document.getElementById("authImage")

  await worker.load()
  await worker.loadLanguage("eng")
  await worker.initialize("eng")
  await worker.setParameters({ tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" })

  authImage.addEventListener("load", recognizeCaptcha)

  recognizeCaptcha()
})()
