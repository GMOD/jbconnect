/**
 * @module
 * @description
 * isAdmin policy provides passage if the user contains the property admin: true.
 *  
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
module.exports = function isAdmin(req, res, next) {
  //var targetFolderId = req.param('id');

  var redirectTo = '/jbrowse/';
  if (typeof req.query.next !== 'undefined') {
      redirectTo = req.query.next;
  }

  // If the requesting user is not logged in, then they are _never_ allowed to write.
  // No reason to continue-- we can go ahead and bail out now.
  if (!req.session.me) {
    return res.redirect(redirectTo);
  }

  // Check the database to see if a permission record exists which matches both the
  // target folder id, the appropriate "type", and the id of the logged-in user.
  /*
  Permission.findOne({
    folder: targetFolderId,
    user: req.session.me,
    type: 'write'
  })
  .exec(function (err, permission) {
*/
    // Unexpected error occurred-- use the app's default error (500) handler.
    //
    // > We do this because this should never happen, and if it does, it means there
    // > is probably something wrong with our database, and we want to know about it!)
    if (err) { return res.serverError(err); }

    // No "write" permission record exists linking this user to this folder.
    // Maybe they got removed from it?  Or maybe they never had permission in the first place...
    if (!permission) {
      return res.redirect('/login');
    }

    // If we made it all the way down here, looks like everything's ok, so we'll let the user through.
    // (from here, the next policy or the controller action will run)
    return next();
/*
  });
  */
};

