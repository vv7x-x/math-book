export function notFound(req, res, _next) {
  res.status(404).json({ message: 'Not Found', path: req.originalUrl })
}

export function errorHandler(err, _req, res, _next) {
  console.error('[error]', err)
  const status = err.status || 500
  res.status(status).json({ message: err.message || 'Internal Server Error' })
}
