const mongoose = require('./connect');
const schemas = require('./schemas');

let schemasNames = Object.keys(schemas);

const models = schemasNames.reduce((acc, name) => {
    acc[name + 'Model'] = mongoose.model(
        name,
        schemas[name]
    );

    
    return acc;
}, {})
module.exports = models

// module.exports = mongoose.model('student',schemas.students)
