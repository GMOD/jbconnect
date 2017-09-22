/**
 * @module
 *
 * @description 
 * Simple policy to allow any authenticated user.
 * Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * 
 * Ref: `Sails Policies Concepts <http://sailsjs.org/#!/documentation/concepts/Policies>`_
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  if (req.session.authenticated) {
    return next();
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.forbidden('You are not permitted to perform this action.');
};
