// ==UserScript==
// @name        [Zuvio] Open questions in side panel
// @namespace   Violentmonkey Scripts
// @match       https://irs.zuvio.com.tw/student5/irs/clickers/*
// @match       https://irs.zuvio.com.tw/student5/irs/questions/*
// @grant       none
// @version     1.0
// @author      -
// @description 12/1/2022, 2:56:05 PM
// ==/UserScript==

// https://stackoverflow.com/a/36673018
function css(strings, ...values) {
  let str = strings[0]
  for (const [index, value] of values.entries()) {
    str += value + strings[index + 1]
  }
  return str
}

function injectCSS(documentObject, CSSString) {
  const style = documentObject.createElement("style")
  style.innerHTML = CSSString
  documentObject.body.append(style)
}

injectCSS(
  document,
  css`
    #content {
      width: 100%;
      max-width: unset;
      height: 100%;
      display: flex;
      justify-content: center;
    }

    .irs-clicker-list,
    .irs-history-questions {
      border-right: 1px solid #e6e6e6;
      overflow: auto;
    }

    .i-c-l-questions {
      max-width: 400px;
    }

    .active-question .i-c-l-q-q-b-top {
      border-left-width: 4px;
      border-left-style: solid;
      border-left-color: #79dfb1;
    }

    #question-content {
      width: 768px;
      border: none;
      background-color: #f9f9f9;
    }
  `
)

const questionContent = document.createElement("iframe")
questionContent.id = "question-content"
questionContent.style.paddingBottom = document.getElementById("footer").offsetHeight
questionContent.onload = () => {
  // After an answer is submitted
  if (new URL(questionContent.contentWindow.location.href).pathname === window.location.pathname) {
    // Reload iframe with the same url
    // Open the answered question
    questionContent.src = questionContent.src
    return
  }

  injectCSS(
    questionContent.contentDocument,
    css`
      #header .irs-header {
        display: none;
      }
    `
  )
}
document.getElementById("content").appendChild(questionContent)

GAFA_clickQuestion = questionId => {
  questionContent.src = `https://irs.zuvio.com.tw/student5/irs/clicker/${questionId}`

  const activeQuestion = document.getElementsByClassName("active-question")[0]
  if (activeQuestion) activeQuestion.classList.remove("active-question")
  document.querySelector(`[onclick^="GAFA_clickQuestion('${questionId}'"]`).classList.add("active-question")
}

irs_question = questionId => {
  questionContent.src = `https://irs.zuvio.com.tw/student5/irs/question/${questionId}`

  const activeQuestion = document.getElementsByClassName("active-question")[0]
  if (activeQuestion) activeQuestion.classList.remove("active-question")
  document.querySelector(`[onclick="irs_question(${questionId})"]`).classList.add("active-question")
}
