var _ = require('lodash'),
    util = require('./util.js');

var request = require('request').defaults({
    baseUrl: 'https://api.venmo.com/v1/'
});

var pickInputs = {
        'action': 'action',
        'actor': 'actor',
        'status': 'status',
        'limit': 'limit',
        'after': 'after',
        'before': 'before'
    },
    pickOutputs = {
        '-': {
            keyName: 'data',
            fields: {
                'status': 'status',
                'date_completed': 'date_completed',
                'target_user': 'target.user',
                'actor_username': 'actor.username',
                'amount': 'amount',
                'note': 'note'
            }
        }
    };

module.exports = {
    /**
     * Process data or error.
     *
     * @param error
     * @param response
     * @param body
     */
    processResult: function (error, response, body) {

        if (error)
            this.fail(error);

        else if (body.error)
            this.fail(body.error);

        else
            this.complete(util.pickResult(body, pickOutputs));
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var accessToken = dexter.environment('venmo_access_token'),
            inputs = util.pickStringInputs(step, pickInputs),
            uriLink = 'payments';

        // check params.
        if (!accessToken)
            return this.fail('A [bitbucket_username, bitbucket_password] environment need for this module.');

        //send API request
        request.get({
            url: uriLink,
            qs: _.merge({access_token: accessToken}, inputs),
            json: true
        }, function (error, response, body) {

            this.processResult(error, response, body);
        }.bind(this));
    }
};
