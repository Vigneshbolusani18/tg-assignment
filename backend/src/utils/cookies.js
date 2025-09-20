export function setRefreshCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: isProd,                 // true on HTTPS (prod)
    sameSite: isProd ? 'none' : 'lax',
    path: '/auth',                  // only sent to /auth/*
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

export function clearRefreshCookie(res) {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/auth',
  });
}
