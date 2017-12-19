/**
 * @module
 * 
 * @description
 * 
 * User is the data model for a user.
 * 
 */
var User = {
    // Enforce model schema in the case of schemaless databases
    schema: true,

    attributes: {
      username  : { type: 'string', unique: true },
      email     : { type: 'email',  unique: true },
      admin     : { type: 'boolean', defaultsTo: false},
      passports : { collection: 'Passport', via: 'user' }
    },
    /**
     * Get list of tracks based on critera in params  
     * @param {object} params - search critera (i.e. {id: 1,user:'jimmy'} )
     * @param {function} cb - callback function(err,array)
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
     * sails> User.SetPassword('juser','password',console.log);
     * undefined
     * null 'Password for juser changed.'

     * @param {string} user - username
     * @param {string} pass - new password
     * @param {function} cb - callback function
     * @returns {undefined}
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
     * sails> User.SetAdmin('juser',true,console.log);
     * undefined
     * null 'Set admin flag for juser to true'
     * 
     * @param {string} user - username
     * @param {boolean} adminflag - true for false
     * @param {function} cb - callback function
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
