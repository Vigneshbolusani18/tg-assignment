export const ok = (res, data) => res.status(200).json(data);
export const created = (res, data) => res.status(201).json(data);
export const badRequest = (res, code = 'bad_request') => res.status(400).json({ error: code });
export const unauthorized = (res, code = 'unauthorized') => res.status(401).json({ error: code });
export const forbidden = (res, code = 'forbidden') => res.status(403).json({ error: code });
export const notFound = (res, code = 'not_found') => res.status(404).json({ error: code });
export const conflict = (res, code = 'conflict') => res.status(409).json({ error: code });
export const serverError = (res, code = 'server_error') => res.status(500).json({ error: code });
