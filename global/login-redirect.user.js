// ==UserScript==
// @name        [NTUT Portal/iStudy] Login redirect
// @namespace   Violentmonkey Scripts
// @match       https://nportal.ntut.edu.tw/*
// @grant       none
// @run-at      document-start
// @version     1.0
// @author      陸嘉康 <https://github.com/mon-jai>
// @description Access NTUT Portal with "https://nportal.ntut.edu.tw/myPortal.do" and iStudy with "https://nportal.ntut.edu.tw/ssoIndex.do?apOu=ischool_plus_oauth", then get redirected after successful login
// @homepage    https://github.com/mon-jai/ntut-violentmonkey-scripts
// ==/UserScript==

"use strict"

async function redirectIfUnauthenticated() {
  const isAuthenticated = await isAuthenticatedPromise
  if (isAuthenticated === false) document.location.replace("https://nportal.ntut.edu.tw/index.do")
}

const isAuthenticatedPromise = new Promise(resolve => {
  // `readystatechange` is only available on `document`
  // https://www.w3.org/TR/2014/NOTE-html5-diff-20141209/#document-extensions
  document.addEventListener("readystatechange", () => {
    if (document.documentElement.outerHTML.includes("重新登入")) resolve(false)
    else resolve(true)
  })
})
const { pathname } = document.location

isAuthenticatedPromise.then(isAuthenticated => {
  if (!isAuthenticated) document.documentElement.style.display = "none"
})

// Portal page
if (pathname === "/myPortal.do") {
  sessionStorage.removeItem("redirect-to-istudy")
  redirectIfUnauthenticated()
}
// iStudy entry page
else if (pathname === "/ssoIndex.do") {
  sessionStorage.setItem("redirect-to-istudy", true)
  redirectIfUnauthenticated()
}
// Login successful/unsuccessful page
else if (pathname === "/login.do") {
  // If a "login again" message is displayed, redirect user to login page
  redirectIfUnauthenticated()

  // Redirect user to iStudy on successful login
  // The following code runs before DOM parsing, and therefore before any script tag is executed
  if (JSON.parse(sessionStorage.getItem("redirect-to-istudy")) === true) {
    sessionStorage.removeItem("redirect-to-istudy")
    document.location.replace("https://nportal.ntut.edu.tw/ssoIndex.do?apOu=ischool_plus_oauth")
  }
}
