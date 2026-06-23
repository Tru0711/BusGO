const requestLogger = (req, res, next) => {
  const startedAt = Date.now();
  const requestId = req.headers['x-request-id'] || `req_${Math.random().toString(36).slice(2, 10)}`;

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms ${requestId}`);
  });

  next();
};

module.exports = requestLogger;