addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  if (request.method == 'POST') {
    const { path, url } = await request.json()
    await redirects.put(path, url)
    return new Response(JSON.stringify({ path, url }), {
      headers: { 'content-type': 'application/json' },
    })
  }
  const url = new URL(request.url)
  if (url.pathname == '/') {
    return new Response(await html.get('index'), {
      headers: { 'content-type': 'text/html' },
    })
  } else {
    let redirect = await redirects.get(url.pathname)

    if (!redirect) {
      return new Response(await html.get('404'), {
        headers: { 'content-type': 'text/html' },
      })
    } else {
      await stats.put(
        `${url.pathname}:${Date.now()}`,
        JSON.stringify(request.headers.entries()),
      )
      return Response.redirect(redirect)
    }
  }
}
