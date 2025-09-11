export function ok(res, data = {}, meta = {}) {
  return res.json({ success: true, data, meta })
}

export function created(res, data = {}, meta = {}) {
  return res.status(201).json({ success: true, data, meta })
}

export function badRequest(res, message = 'Bad Request') {
  return res.status(400).json({ success: false, message })
}

export function unauthorized(res, message = 'Unauthorized') {
  return res.status(401).json({ success: false, message })
}

export function forbidden(res, message = 'Forbidden') {
  return res.status(403).json({ success: false, message })
}

export function notFoundRes(res, message = 'Not Found') {
  return res.status(404).json({ success: false, message })
}

export function serverError(res, message = 'Internal Server Error') {
  return res.status(500).json({ success: false, message })
}
