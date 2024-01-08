// ==UserScript==
// @name        [Zuvio] Open questions in side panel
// @namespace   Violentmonkey Scripts
// @match       https://irs.zuvio.com.tw/student5/irs/clickers/*
// @match       https://irs.zuvio.com.tw/student5/irs/questions/*
// @match       https://irs.zuvio.com.tw/student5/irs/feedbacks/*
// @match       https://irs.zuvio.com.tw/student5/irs/course/*
// @grant       none
// @version     1.0
// @author      -
// @description 12/1/2022, 2:56:05 PM
// ==/UserScript==

// https://stackoverflow.com/a/44254377/
const css = (strings, ...rest) => String.raw({ raw: strings }, ...rest)

const routeToFunctionName = {
  clicker: "GAFA_clickQuestion",
  question: "irs_question",
  bulletin: "irs_getBulletin",
  forum: "irs_getForum",
}
const { pathname: originalPathname } = window.location

function injectCSS(documentObject, CSSString) {
  const style = documentObject.createElement("style")
  style.innerHTML = CSSString
  documentObject.body.append(style)
}

injectCSS(
  document,
  css`
    #content {
      max-width: unset;
      height: 100%;
      display: flex;
      justify-content: center;
    }

    .irs-clicker-list,
    .irs-history-questions,
    .irs-feedback-forum:not(:has(> .forums.hidden)),
    .irs-course:not(:has(> .bulletins.hidden)) {
      width: 450px;
      border-right: 1px solid #e6e6e6;
      overflow: auto;
    }

    .i-f-f-f-b-m-b-content {
      height: unset !important;
      max-height: 72px;
    }

    .active-question {
      & > .i-c-l-q-q-b-top,
      &.i-f-f-forum-box {
        border-left: 4px solid #79dfb1 !important;
      }
    }

    #question-content {
      width: 768px;
      border: none;
      background-color: #f9f9f9;
      padding-top: ${document.querySelector(".i-h-navi-bar > .button")?.offsetHeight ?? 0}px;
      padding-bottom: ${document.getElementById("footer").offsetHeight}px;

      /* 私訊老師 page */
      .irs-feedback-forum:has(> .forums.hidden) ~ & {
        display: none;
      }

      /* 課程相關 page */
      .irs-course:has(> .bulletins.hidden) ~ & {
        display: none;
      }
    }

    /* 課程相關 page */
    .course-info {
      width: 768px;
    }
  `,
)

for (const [route, functionName] of Object.entries(routeToFunctionName)) {
  window[functionName] = questionId => {
    const url = `https://irs.zuvio.com.tw/student5/irs/${route}/${questionId}`
    questionContent.src = url
    history.pushState("", "", url)

    const activeQuestion = document.getElementsByClassName("active-question")[0]
    const quote = route !== "bulletin" ? "'" : ""
    if (activeQuestion) activeQuestion.classList.remove("active-question")
    document.querySelector(`[onclick^="${functionName}(${quote}${questionId}"]`).classList.add("active-question")
  }
}

const questionContent = document.createElement("iframe")
questionContent.id = "question-content"
questionContent.onload = () => {
  // After an answer is submitted
  if (new URL(questionContent.contentWindow.location.href).pathname === originalPathname) {
    // Open the answered question (reload iframe with the same url)
    questionContent.src = questionContent.src
    return
  }

  injectCSS(
    questionContent.contentDocument,
    css`
      #header {
        display: none;
      }

      #content .irs-bulletin-homework .forums .i-f-f-forum-box {
        cursor: unset;
      }

      .i-f-f-f-b-f-l-file-box {
        cursor: pointer;
      }
    `,
  )

  const attachments = questionContent.contentDocument.getElementsByClassName("i-f-f-f-b-f-l-file-box")
  for (const attachment of attachments) {
    attachment.addEventListener("auxclick", ({ button }) => button === 1 && attachment.onclick())
  }
}
document.getElementById("content").appendChild(questionContent)
