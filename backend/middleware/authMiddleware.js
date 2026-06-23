const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token missing',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    User.findById(decoded.userId)
      .select('name email role isVerified isApproved phone companyName businessType address gstNumber serviceAreas')
      .then((user) => {
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Not authorized, user not found',
          });
        }

        req.user = {
          userId: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          isApproved: user.isApproved,
          phone: user.phone,
          companyName: user.companyName,
          businessType: user.businessType,
          address: user.address,
          gstNumber: user.gstNumber,
          serviceAreas: user.serviceAreas,
        };

        return next();
      })
      .catch(() => {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, token invalid',
        });
      });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid',
    });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: insufficient role',
      });
    }

    return next();
  };
};

module.exports = protect;
module.exports.authorizeRoles = authorizeRoles;
