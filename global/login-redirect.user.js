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

const isAuthenticatedPromise = new Promise(resolve => {
  const checkAndResolvePromise = () => {
    if (document.documentElement.outerHTML.includes("重新登入")) resolve(false)
    else resolve(true)
  }

  if (document.readyState === "complete") checkAndResolvePromise()
  else document.addEventListener("readystatechange", checkAndResolvePromise)
})

isAuthenticatedPromise.then(isAuthenticated => {
  const { pathname } = document.location

  if (!isAuthenticated) {
    // Attempting to log in to portal
    if (pathname === "/ssoIndex.do") sessionStorage.setItem("redirect-to-istudy", true)
    // Attempting to log in to istudy
    else if (pathname === "/myPortal.do") sessionStorage.removeItem("redirect-to-istudy")

    document.documentElement.style.display = "none"
    document.location.replace("https://nportal.ntut.edu.tw/index.do")
    return
  }

  // Redirect to iStudy on successful login
  if (pathname === "/myPortal.do" && JSON.parse(sessionStorage.getItem("redirect-to-istudy")) === true) {
    sessionStorage.removeItem("redirect-to-istudy")

    document.documentElement.style.display = "none"
    document.location.replace("https://nportal.ntut.edu.tw/ssoIndex.do?apOu=ischool_plus_oauth")
  }
})
