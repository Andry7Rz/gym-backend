const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role_code)) {
      return res.status(403).json({
        error: `Acceso prohibido. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = { authorizeRoles };