/**
 * @module
 * @description
 * Dataset is a model that represents the JBrowse dataset.  Generally, this includes
 * path to the dataset and some of the data contained in trackList.json.
 * 
 * Datasets known to JBConnect are defined in config/globals.js
 * (see: :ref:`jbs-globals-config`)
 * 
 * Dataset object:
 * ::
 *   {
 *     "name": "Volvox",
 *     "path": "sample_data/json/volvox",
 *     "createdAt": "2018-02-01T05:38:26.320Z",
 *     "updatedAt": "2018-02-01T05:38:26.320Z",
 *     "id": 1
 *   }
 *      
 * Ref: `Sails Models and ORM <http://sailsjs.org/documentation/concepts/models-and-orm/models>`_
 */

module.exports = {

    attributes: {
        name: {
            type: 'string',
        }, 
        path: {
            type: 'string',
            unique: true
        },
        tracks: {
            collection: 'track',
            via: 'id'
        }
    },
    /*
     * cached assoc array of datasets {path:"sample_data/json/volvox", id:1}
     * is indexed by both id and path.
     */
    _dataSets: {},
    
    /**
     * Initializes datasets as defined in config/globals.js.
     * (see: :ref:`jbs-globals-config`)
     * @param {object} params - callback function 
     * @param {function} cb - callback function 
     * @returns {undefined}
     */
    Init(params,cb) {
        this.Sync(cb);
        
        // todo: need to handle this in callback
        //cb();
    },
    /**
     * Get list of tracks based on critera in params
     *   
     * @param {object} params - search critera (i.e. ``{id: 1,user:'jimmy'}`` )
     * @param {function} cb - callback ``function(err,array)``
     */
    Get(params,cb) {
        this.find(params).then(function(foundList) {
           return cb(null,foundList) 
        }).catch(function(err){
           return cb(err);
        });
    },
    /**
     * Given either a dataset string (ie. "sample_data/json/volvox" or the database id of a dataset,
     * it returns a dataset object in the form:
     * 
     * ::
     *     
     *     {
     *         path: "sample_data/json/volvox",
     *         id: 3
     *     }
     *
     * 
     * @param {val} dval - dataset string (ie. "sample_data/json/volvox") or id (int)
     * 
     *      
     * Code Example
     * ::
     *     {
     *         path: "sample_data/json/volvox",
     *         id: 3
     *     }
     *     
     * @returns {object} - dataset object
     *      dataset (string - i.e. "sample_data/json/volvox" if input was an id
     *      returns null if not found
     *      
     */
    Resolve(dval){
        if (typeof this._dataSets[dval] !== 'undefined')
            return this._dataSets[dval];
        sails.log.error('Dataset.Resolve not found (we shouldnt get here)',dval);
        return null;
    },
    /**
     * Sync datasets, defined in globals with database.
     * 
     * todo: need to improve, perhaps use async?
     * 
     * @param (function) cb - callback function
     */
    Sync(cb) {
        sails.log.debug('Dataset.Sync()');
        var g = sails.config.globals.jbrowse;
        var thisb = this;

        // convert to assoc array in confItems
        for(var i in g.dataSet) {
            thisb._dataSets[g.dataSet[i].path] = g.dataSet[i];
            thisb._dataSets[g.dataSet[i].path].name = i;
        }

        (async () => {
            await Dataset.destroy({});

            for(var i in thisb._dataSets) {
                var created = await Dataset.create(thisb._dataSets[i]);
                console.log("dataset id",created.id,created.path);
                thisb._dataSets[created.path].id = created.id;
            }
            cb();
        })();
    }
};

