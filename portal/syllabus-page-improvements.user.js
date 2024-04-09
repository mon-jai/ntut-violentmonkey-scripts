// ==UserScript==
// @name        [NTUT Portal] Syllabus page improvements
// @namespace   Violentmonkey Scripts
// @match       https://aps.ntut.edu.tw/course/*/ShowSyllabus.jsp
// @grant       none
// @version     1.0
// @author      陸嘉康 <https://github.com/mon-jai>
// @description Improvements to the readability of NTUT Portal's syllabus page
// ==/UserScript==

// https://stackoverflow.com/a/44254377/
const html = (strings, ...rest) => String.raw({ raw: strings }, ...rest)
const css = (strings, ...rest) => String.raw({ raw: strings }, ...rest)

for (const textarea of document.getElementsByTagName("textarea")) {
  textarea.insertAdjacentHTML(
    "afterend",
    html`<div class="content">
      ${textarea.value
        .split("\n\n")
        .map(content => content.trim().replaceAll(/\s*\n\s*/g, "<br>"))
        .filter(content => content.length > 0)
        .map(content => html`<p>${content}</p>`)
        .join("")}
    </div>`,
  )
}

const styleElement = document.createElement("style")
styleElement.innerHTML = css`
  * {
    color: rgba(0, 0, 0, 0.87);
    line-height: 1.5;
  }

  body {
    max-width: 1140px;
    margin: 100px auto;
    background: none;
    font-family: system-ui;
  }

  img[src="../image/or_ball.gif"],
  br:not(.content br),
  textarea,
  input[type="button"] {
    display: none;
  }

  table {
    width: 100%;
    margin: 1rem 0;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 0.5rem;
    border-color: rgba(0, 0, 0, 0.12);
  }

  th {
    white-space: nowrap;

    &:last-child {
      font-weight: normal;
    }

    p:nth-of-type(2) & {
      text-align: left;
    }
  }
`
document.body.append(styleElement)
