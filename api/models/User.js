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
};

module.exports = User;
