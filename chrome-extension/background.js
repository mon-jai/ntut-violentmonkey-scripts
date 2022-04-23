chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  // https://stackoverflow.com/a/71520415
  sendResponse()

  const cookies = await chrome.cookies.getAll({ domain: "nportal.ntut.edu.tw" })

  for (const cookie of cookies) {
    await chrome.cookies.remove({ url: `https://${cookie.domain}${cookie.path}`, name: cookie.name })
  }
})
