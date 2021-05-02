'use strict';

var mongoose = require('mongoose'),
    AvgResultSchema = null;

module.exports = mongoose.model('AvgResult', {
    _Id: {type: mongoose.Schema.ObjectId, 'ref': 'User'},
    avgRating: {type: Number}
});

var AvgResult = mongoose.model('AvgResult', AvgResultSchema, null);
module.exports = AvgResult;