// ==UserScript==
// @name        [Zuvio] Open questions in modal
// @namespace   Violentmonkey Scripts
// @match       https://irs.zuvio.com.tw/student5/irs/clickers/*
// @grant       none
// @version     1.0
// @author      -
// @description 12/1/2022, 2:56:05 PM
// ==/UserScript==

// https://stackoverflow.com/a/36673018
function html(strings, ...values) {
  let str = strings[0]
  for (const [index, value] of values.entries()) {
    str += value + strings[index + 1]
  }
  return str
}

// https://stackoverflow.com/a/13382873
function getScrollbarWidth() {
  // Creating invisible container
  const outer = document.createElement("div")
  outer.style.visibility = "hidden"
  outer.style.overflow = "scroll" // forcing scrollbar to appear
  document.body.appendChild(outer)

  // Creating inner element and placing it in the container
  const inner = document.createElement("div")
  outer.appendChild(inner)

  // Calculating difference between container's full width and the child width
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth

  // Removing temporary elements from the DOM
  outer.parentNode.removeChild(outer)

  return scrollbarWidth
}

const modalHTML = html`
  <style>
    #modal {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 10000;

      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.32);

      display: none;
      --navbar-height: calc(50px + 8px); /* shadow = 4px offst + 4px blur = 8px */
    }

    #modal.show {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #modal-inner {
      width: 60%;
      height: 80%;
      overflow: hidden;
      box-shadow: 0px 11px 15px -7px rgb(0 0 0 / 20%), 0px 24px 38px 3px rgb(0 0 0 / 14%),
        0px 9px 46px 8px rgb(0 0 0 / 12%);
      border-radius: 12px;
    }

    #question-content {
      border: none;
      width: 100%;
      height: calc(100% + var(--navbar-height));
      margin-top: calc(-1 * var(--navbar-height));
      background: #505565;
    }
  </style>

  <div id="modal">
    <div id="modal-inner">
      <iframe id="question-content"></iframe>
    </div>
  </div>
`

document.body.insertAdjacentHTML("afterend", modalHTML)

const questionContent = document.getElementById("question-content")
const modal = document.getElementById("modal")

modal.onclick = event => {
  if (event.target.id == "modal") {
    event.target.classList.remove("show")
    document.body.style.overflow = ""
    document.body.style.paddingRight = ""
    questionContent.src = ""
  }
}

GAFA_clickQuestion = questionId => {
  modal.classList.add("show")
  document.body.style.overflow = "hidden"
  document.body.style.paddingRight = `${getScrollbarWidth()}px`
  questionContent.src = `https://irs.zuvio.com.tw/student5/irs/clicker/${questionId}`
}
