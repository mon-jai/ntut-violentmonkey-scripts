// ==UserScript==
// @name        iStudy login redirect
// @namespace   Violentmonkey Scripts
// @match       https://nportal.ntut.edu.tw/*
// @grant       none
// @version     1.0
// @author      Loh Ka Hong
// @description Access iStudy with the link "https://nportal.ntut.edu.tw/ssoIndex.do?apOu=ischool_plus_", and get redirected after successful login
// @homepage    https://github.com/mon-jai/ntut-violentmonkey-scripts
// ==/UserScript==

{
  const pathname = document.location.pathname

  if (pathname === "/ssoIndex.do" && document.querySelector('a[onclick="logout()"]')?.innerText === "重新登入") {
    sessionStorage.setItem("redirect-to-istudy", true)
    document.location.replace("https://nportal.ntut.edu.tw/index.do")
  } else if (pathname === "/login.do") {
    const loginAgainButton = document.querySelector("input[value=重新登入]")
    if (loginAgainButton !== null) loginAgainButton.click()
  } else if (pathname === "/myPortal.do" && sessionStorage.getItem("redirect-to-istudy") === "true") {
    sessionStorage.removeItem("redirect-to-istudy")
    document.location.replace("https://nportal.ntut.edu.tw/ssoIndex.do?apOu=ischool_plus_")
  }
}
