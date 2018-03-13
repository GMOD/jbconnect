/**
 * @module
 * @description
 * 
 * User is the data model for a user.
 * 
 * Example User object:
 * ::
 *     {
 *       "username": "juser",
 *       "email": "juser@jbrowse.org",
 *       "admin": true,
 *       "createdAt": "2017-11-29T21:00:56.726Z",
 *       "updatedAt": "2017-11-29T21:00:56.726Z",
 *       "id": 2
 *     }
 * 
 * 
 */
var User = {
    // Enforce model schema in the case of schemaless databases
    schema: true,

    attributes: {
      username  : { type: 'string', unique: true },
      email     : { type: 'email',  unique: true },
      // the admin flag is set upon create to the default value
      // only admins can do certain write operations.
      // use to change: ./jbutil --setadmin [username] [true|false]
      admin     : { type: 'boolean', defaultsTo: true},
      passports : { collection: 'Passport', via: 'user' }
    },
    /**
     * Get list of tracks based on critera in params 
     *  
     * @param {object} params - search critera
     * @param {function} cb - callback ``function(err,array)``
     * 
     */
    Get: function(params,cb) {
        this.find(params).then(function(foundList) {
           return cb(null,foundList) 
        }).catch(function(err){
           return cb(err);
        });
    },
    /*
     * Set password for a given user
     * 
     * Example
     * ``User.SetPassword('juser','password',console.log);``
     * 
     * @param {string} user - username
     * @param {string} pass - new password
     * @param {function} cb - callback function
     * 
     */
    SetPassword: function(user,pass,cb) {
    
        this.findOne({username:user}).exec(function(err,ufound) {
            if (err) {
                if (typeof cb === 'function' ) return cb(err);
                else return;
            }
            //console.log("found user",ufound);
            
            Passport.update({user:ufound.id},{password:pass}).exec(function(err,updated){
                if (err) {
                    if (typeof cb === 'function' ) return cb(err);
                    else return;
                }
                var msg = 'Password for '+user+' changed.';
                //console.log(msg);
                
                if (typeof cb === 'function' ) return cb(null,msg);
                else return;
            });
            
        });
    },
    /*
     * Set the admin flag for a user 
     * 
     * Example:
     * ``User.SetAdmin('juser',true,console.log);``
     * 
     * @param {string} user - username
     * @param {boolean} adminflag - true for false
     * @param {function} cb - callback function
     * 
     */
    SetAdmin: function(user,adminflag,cb) {

        if ( typeof adminflag !== 'boolean') {
            if (typeof cb === 'function' ) return cb('Admin flag must be boolean.');
            else return;
        }
        
        this.update({username:user},{admin: adminflag}).exec(function(err,updated) {
            if (err) {
                if (typeof cb === 'function' ) return cb(err);
                else return;
            }
            var msg = 'Set admin flag for '+user+' to '+updated[0].admin;
            //console.log(msg);

            if (typeof cb === 'function' ) return cb(null,msg);
            else return;
            
        });
    }
};

module.exports = User;
