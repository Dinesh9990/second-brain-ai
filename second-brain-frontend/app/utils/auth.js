const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Not authorized" });
  }

  try {
    // ✅ Extract token properly
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, "secretkey");
    req.user = decoded;

    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};