chrome.runtime.onMessage.addListener(async () => {
  // https://stackoverflow.com/a/71520415
  // sendResponse()

  const cookies = await chrome.cookies.getAll({ domain: "nportal.ntut.edu.tw" })

  console.log(cookies)

  for (const cookie of cookies) {
    console.log(cookie)
    await chrome.cookies.remove({ url: `https://${cookie.domain}${cookie.path}`, name: cookie.name })
  }

  console.log(await chrome.cookies.getAll({ domain: "nportal.ntut.edu.tw" }))
})
