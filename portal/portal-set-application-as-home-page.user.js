// ==UserScript==
// @name        [NTUT Portal] Set "Applications" as home page
// @namespace   Violentmonkey Scripts
// @match       https://nportal.ntut.edu.tw/myPortal.do*
// @grant       none
// @run-at      document-end
// @version     1.0
// @author      Loh Ka Hong
// @description Set "Applications" as NTUT Portal's home page
// @homepage    https://github.com/mon-jai/ntut-violentmonkey-scripts
// ==/UserScript==

{
  function waitAndRemove(selector) {
    new MutationObserver((_, observer) => {
      const element = document.querySelector(selector)
      if (element) {
        element.remove()
        observer.disconnect()
      }
    }).observe(document.body, { childList: true, subtree: true })
  }

  function retryIfFailed(callback) {
    const interval = setInterval(() => {
      try {
        callback()
        clearInterval(interval)
      } catch {}
    }, 10)
  }

  waitAndRemove("a[href*='toIndex']")
  waitAndRemove("a[href*='aptreeMain']")

  if (document.getElementById("Column1")) retryIfFailed(aptreeMain)
}
