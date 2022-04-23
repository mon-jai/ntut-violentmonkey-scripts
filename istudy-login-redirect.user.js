// ==UserScript==
// @name        iStudy login redirect
// @namespace   Violentmonkey Scripts
// @match       https://nportal.ntut.edu.tw/*
// @grant       none
// @run-at      document-start
// @version     1.0
// @author      Loh Ka Hong
// @description Access iStudy with the link "https://nportal.ntut.edu.tw/ssoIndex.do?apOu=ischool_plus_", and get redirected after successful login
// @homepage    https://github.com/mon-jai/ntut-violentmonkey-scripts
// ==/UserScript==

{
  function redirectIfLoginIsRequired(redirectedCallback) {
    // `readystatechange` is only available on `document`
    // https://www.w3.org/TR/2014/NOTE-html5-diff-20141209/#document-extensions
    document.addEventListener("readystatechange", () => {
      if (document.documentElement.outerHTML.includes("重新登入")) {
        if (redirectedCallback) redirectedCallback()
        document.location.replace("https://nportal.ntut.edu.tw/index.do")
      }
    })
  }

  const pathname = document.location.pathname

  if (pathname === "/ssoIndex.do") {
    redirectIfLoginIsRequired(() => sessionStorage.setItem("redirect-to-istudy", true))
  } else if (pathname === "/login.do") {
    redirectIfLoginIsRequired()

    // The following code runs before DOM parsing, and therefore before any script tag is executed
    if (sessionStorage.getItem("redirect-to-istudy") === "true") {
      sessionStorage.removeItem("redirect-to-istudy")
      document.location.replace("https://nportal.ntut.edu.tw/ssoIndex.do?apOu=ischool_plus_")
    }
  }
}