/**
 * @module
 * @description
 * isAdmin policy provides passage if the user contains the property admin: true.
 * 
 * req.session looks something like this:
 * req.session Session {
 *      cookie: { path: '/',
 *          _expires: null,
 *          originalMaxAge: null,
 *          httpOnly: true 
 *      },
 *      passport: { user: 2 },
 *      authenticated: true, (true if logged in, 
 *      user: { username: 'juser', email: 'juser@jbrowse.org' } 
 * }
 *  
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
module.exports = function isAdmin(req, res, next) {
    //console.log("isAdmin req.session",req.session);
    var ses = req.session;
    
    if (typeof ses.authenticated !== 'undefined' && ses.authenticated===true) {
        if (typeof ses.user !== 'undefined') {
            
            User.findOne({username:ses.user.username}).then(function(foundUser) {
                if (typeof foundUser.admin !== 'undefined' && foundUser.admin===true) {
                    return next();  // pass
                }
                nonAdminAction();   // nopass
            }).catch(function(err) {
                //return res.serverError(err);
                noAdminAction();    // nopass
            })
        }
        else nonAdminAction();
    }
    else nonAdminAction();
    
    function nonAdminAction() {
        
        var redirectTo = '/jbrowse/';
        if (typeof req.query.next !== 'undefined') {
            redirectTo = req.query.next;
        }
        
        return res.redirect(redirectTo);
    }
};

