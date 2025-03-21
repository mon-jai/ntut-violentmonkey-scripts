// ==UserScript==
// @name        [NTUT Portal/iStudy] Autofill login page captcha
// @namespace   Violentmonkey Scripts
// @match       https://nportal.ntut.edu.tw/index.do
// @grant       none
// @require     https://unpkg.com/tesseract.js@^2/dist/tesseract.min.js
// @version     1.0
// @author      陸嘉康 <https://github.com/mon-jai>
// @description Autofill captcha in NTUT service's login page
// @homepage    https://github.com/mon-jai/ntut-violentmonkey-scripts
// ==/UserScript==

"use strict"

// https://stackoverflow.com/a/44254377/
const html = (strings, ...rest) => String.raw({ raw: strings }, ...rest)

function imgToBase64(img) {
  const canvas = document.createElement("canvas")
  canvas.width = img.width
  canvas.height = img.height
  canvas.getContext("2d").drawImage(img, 0, 0)
  return canvas.toDataURL()
}

;(async () => {
  async function recognizeCaptcha() {
    authCodeInput.style.display = ""
    authCodeInput.value = ""
    authCharacters.style.display = "none"

    const code = (await worker.recognize(imgToBase64(authImage))).data.text.trim()
    if (code.length !== 4) {
      changeAuthImage()
      return
    }

    for (const [index, char] of Array.from(code).entries()) authCharacterInputs[index].value = char
    authCodeInput.value = code

    authCodeInput.style.display = "none"
    authCharacters.style.display = ""
    authCharacterInputs[0].dispatchEvent(new Event("input"))
  }

  const authCodeInput = document.getElementById("authcode")
  authCodeInput.placeholder = "Recognizing code..."
  authCodeInput.parentElement.insertAdjacentHTML(
    "beforeend",
    html`
      <div id="auth-characters">
        <input minlength="1" maxlength="1" />
        <input minlength="1" maxlength="1" />
        <input minlength="1" maxlength="1" />
        <input minlength="1" maxlength="1" />
      </div>

      <style>
        #auth-characters {
          width: 170px;
          height: 32px;
          margin-top: 3px;

          display: inline-flex;
          gap: 0.25rem;
        }

        #auth-characters > input {
          border: 1px solid #ccc;
          font-size: 1.4em;

          width: 0;
          flex: 1;
          text-align: center;
        }
      </style>
    `,
  )

  const authCharacters = document.getElementById("auth-characters")
  authCharacters.style.display = "none"

  const authCharacterInputs = Array.from(authCharacters.children)
  for (const [index, authCharacterInput] of authCharacterInputs.entries()) {
    authCharacterInput.addEventListener("focus", ({ currentTarget }) => currentTarget.select())
    authCharacterInput.addEventListener("input", ({ currentTarget }) => {
      const normalizedChar = currentTarget.value
        .toUpperCase()
        // https://stackoverflow.com/a/58515363/
        .replace(/[\uff01-\uff5e]/, fullWidthChar => String.fromCharCode(fullWidthChar.charCodeAt(0) - 0xfee0))

      currentTarget.value = normalizedChar
      currentTarget.select()
      authCodeInput.value = Array.from(authCodeInput.value).with(index, normalizedChar).join("")
    })
  }

  const worker = window.Tesseract.createWorker()
  await worker.load()
  await worker.loadLanguage("eng")
  await worker.initialize("eng")
  await worker.setParameters({ tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" })

  const authImage = document.getElementById("authImage")
  authImage.addEventListener("load", recognizeCaptcha)

  recognizeCaptcha()
})()
