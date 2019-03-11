/**
 * @namespace AuthController
 * @description
 * Authentication Controller.
 * 
 * See also Passport model.
 */
var AuthController = {
  /**
   * Render the login page
   *
   * The login form itself is just a simple HTML form:
   * ::
   *   <form role="form" action="/auth/local" method="post">
   *     <input type="text" name="identifier" placeholder="Username or Email">
   *     <input type="password" name="password" placeholder="Password">
   *     <button type="submit">Sign in</button>
   *   </form>
   *
   * You could optionally add CSRF-protection as outlined in the documentation:
   * http://sailsjs.org/#!documentation/config.csrf
   *
   * A simple example of automatically listing all available providers in a
   * Handlebars template would look like this:
   * ::
   *   {{#each providers}}
   *     <a href="/auth/{{slug}}" role="button">{{name}}</a>
   *   {{/each}}
   *
   * The ``next`` parameter can specify the target URL upon successful login.
   *
   * Example: ``GET http://localhost:1337/login?next=http://localhost:1337/jbrowse?data=sample_data/json/volvox``
   *
   * @param {Object} req - request
   * @param {Object} res - response
   * 
   * @memberof AuthController
   * @method login
   */
  login: function (req, res) {
    sails.log.debug("/login");
    var strategies = sails.config.passport
      , providers  = {};

    // Get a list of available providers for use in your templates.
    Object.keys(strategies).forEach(function (key) {
      if (key === 'local') {
        return;
      }

      providers[key] = {
        name: strategies[key].name
      , slug: key
      };
    });

    // Render the `auth/login.ext` view
    res.view('auth/blogin',{
      providers : providers
    , errors    : req.flash('error')
    });
  },

  /**
   * Log out a user and return them to the homepage
   *
   * Passport exposes a logout() function on req (also aliased as logOut()) that
   * can be called from any route handler which needs to terminate a login
   * session. Invoking logout() will remove the req.user property and clear the
   * login session (if any).
   *
   * For more information on logging out users in Passport.js, check out:
   * http://passportjs.org/guide/logout/
   *
   * Example: ``GET http://localhost:1337/logout``
   *
   * @param {Object} req - request
   * @param {Object} res - response
   * 
   */
  logout: function (req, res) {
    sails.log.debug("/logout");
    req.logout();
    
    // mark the user as logged out for auth purposes
    req.session.authenticated = false;
    
    if (typeof req.session.user !== 'undefined')
        sails.log.info("User Logged Out: ",req.session.user.username);

    var redirectTo = '/jbrowse';

    /* istanbul ignore next */
    if (typeof req.query.next !== 'undefined'){
        sails.log.debug("req.query.next",req.query.next);
        redirectTo = req.query.next;
    }
    sails.log.info("redirecting to"+redirectTo);
      
    res.redirect(redirectTo);
  },

  /**
   * Render the registration page
   *
   * Just like the login form, the registration form is just simple HTML:
   * ::
   *   <form role="form" action="/auth/local/register" method="post">
   *     <input type="text" name="username" placeholder="Username">
   *     <input type="text" name="email" placeholder="Email">
   *     <input type="password" name="password" placeholder="Password">
   *     <button type="submit">Sign up</button>
   *   </form>
   *
   * ``GET /register``
   *
   * @param {Object} req - request
   * @param {Object} res - response
   * 
   */
  /* istanbul ignore next: not sure we get here */
  register(req, res) {
    sails.log.debug("/register");
    res.view('auth/bregister',{
      errors: req.flash('error')
    });
  },
  /**
   * get login state
   * 
   * ``GET http://localhost:1337/loginstate``
   * 
   * Example Result:
   * ::
   *    {
   *        "loginstate": true,
   *        "user": {
   *            "username": "juser",
   *            "email": "juser@jbrowse.org"
   *        }
   *    }
   * 
   * @param {object} req - request
   * @param {object} res - response
   * 
   */
  loginstate: function (req, res) {
    sails.log.info("/loginstate");
    
    res.send({
        loginstate: req.session.authenticated,
        user: req.session.user
    });
  },

  /**
   * Create a third-party authentication endpoint
   *
   * @param {Object} req - request
   * @param {Object} res - response
   * 
   */
  provider: function (req, res) {
    passport.endpoint(req, res);
  },

  /**
   * Create a authentication callback endpoint
   *
   * This endpoint handles everything related to creating and verifying Pass-
   * ports and users, both locally and from third-aprty providers.
   *
   * Passport exposes a login() function on req (also aliased as logIn()) that
   * can be used to establish a login session. When the login operation
   * completes, user will be assigned to req.user.
   *
   * For more information on logging in users in Passport.js, check out:
   * http://passportjs.org/guide/login/
   *
   * @param {Object} req - request
   * @param {Object} res - response
   * 
   */
  callback(req, res) {
    //  sails.log.debug("authController callback()");
    /* istanbul ignore next */
    function tryAgain (err) {

      // Only certain error messages are returned via req.flash('error', someError)
      // because we shouldn't expose internal authorization errors to the user.
      // We do return a generic error and the original request body.
      var flashError = req.flash('error')[0];

      if (err && !flashError ) {
        req.flash('error', 'Error.Passport.Generic');
      } else if (flashError) {
        req.flash('error', flashError);
      }
      req.flash('form', req.body);

      // If an error was thrown, redirect the user to the
      // login, register or disconnect action initiator view.
      // These views should take care of rendering the error messages.
      var action = req.param('action');

      switch (action) {
        case 'register':
          sails.log.info("*** Register failure ***");
          res.redirect('/register');
          break;
        case 'disconnect':
          res.redirect('back');
          break;
        default:
          let params = req.allParams();
          //console.log(params);
          sails.log.error("*** Login failure ***");
          let redirectTo = '/login';
          if (params.next)
              redirectTo += '?next='+params.next;
          res.redirect(redirectTo);
      }
    }

    passport.callback(req, res, function (err, user, challenges, statuses) {
      /* istanbul ignore next */
      if (err || !user) {
        return tryAgain(challenges);
      }
      /* istanbul ignore next */
      if (typeof req.login === 'undefined') {
          sails.log.error("req.login undefined - passport.callback");
          return;
      }
      req.login(user, function (err) {
        /* istanbul ignore next */
        if (err) {
          return tryAgain(err);
        }
        
        // Mark the session as authenticated to work with default Sails sessionAuth.js policy
        req.session.authenticated = true;
        req.session.user = {
            username: user.username,
            email: user.email
        }
              sails.log.info("User Logged In: ",user.username);
              sails.log.info("params",req.query.next);
              
              var redirectTo = "/";
              // istanbul ignore next
              if (typeof req.query.next !== 'undefined')
                  redirectTo = req.query.next;

        sails.log.info("redirecting to"+redirectTo);
        res.redirect(redirectTo);
      });
    });
  },

  /**
   * Disconnect a passport from a user
   *
   * ``GET /logout``
   *
   * @param {Object} req - request
   * @param {Object} res - response
   * 
   */
  /* istanbul ignore next */
  disconnect(req, res) {
      sails.log.debug("authController disconnect()");
    passport.disconnect(req, res);
  }
};

module.exports = AuthController;
