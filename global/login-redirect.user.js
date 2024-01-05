// ==UserScript==
// @name        [NTUT Portal/iStudy] Login redirect
// @namespace   Violentmonkey Scripts
// @match       https://nportal.ntut.edu.tw/*
// @grant       none
// @run-at      document-start
// @version     1.0
// @author      Loh Ka Hong
// @description Access NTUT Portal with "https://nportal.ntut.edu.tw/myPortal.do" and iStudy with "https://nportal.ntut.edu.tw/ssoIndex.do?apOu=ischool_plus_oauth", then get redirected after successful login
// @homepage    https://github.com/mon-jai/ntut-violentmonkey-scripts
// ==/UserScript==

"use strict"

async function redirectIfUnauthenticated() {
  const isAuthenticated = await new Promise(resolve => {
    // `readystatechange` is only available on `document`
    // https://www.w3.org/TR/2014/NOTE-html5-diff-20141209/#document-extensions
    document.addEventListener("readystatechange", () =>
      resolve(!document.documentElement.outerHTML.includes("重新登入")),
    )
  })
  if (isAuthenticated) return

  document.documentElement.style.display = "none"
  document.location.replace("https://nportal.ntut.edu.tw/index.do")
}

const { pathname } = document.location

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
  if (!JSON.parse(sessionStorage.getItem("redirect-to-istudy"))) return

  sessionStorage.removeItem("redirect-to-istudy")
  document.location.replace("https://nportal.ntut.edu.tw/ssoIndex.do?apOu=ischool_plus_oauth")
}
