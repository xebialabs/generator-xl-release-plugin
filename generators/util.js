var path = require('path');
var fs = require('fs');
var EOL = require('os').EOL;
var chalk = require('chalk');
var _ = require('lodash');

/**
 * Receives a configuration object with the desired modificiations. Will mostly be
 * used for modification of 'synthetic.xml'.
 *
 * @param  {[type]} config [description]
 */
function appendType(config) {
    var needle = new RegExp(_.get(config, 'needle', '<\/synthetic>'));
    var fullPath = path.join(config.path, config.file);
    var content = fs.readFileSync(fullPath, 'utf8');

    var lines = content.split(EOL);
    var lastTypeIndex = 0;
    lines.forEach(function (line, i) {
        if (needle.test(line)) {
            lastTypeIndex = i;
        }
    });

    var type = config.type;
    type.unshift('');
    type.push('');

    var indent = _.get(config, 'indent', 4);
    lines.splice(lastTypeIndex, 0, type.map(function (line) {
        return _.repeat(' ', indent) + line;
    }).join(EOL));

    var newContent = lines.join(EOL);

    fs.writeFileSync(fullPath, newContent);
}

/**
 * Converts a namespace to a path, i.e. some.task.namespace -> some/task/namespace
 *
 * @param  {String} namespace Type namespace
 * @return {String}           Returns a path generated from the names
 */
function namespaceToPath(namespace) {
    return _.reduce(_.split(namespace, '.'), function (full, segment) {
        return path.join(full, segment);
    });
}

/**
 * Generates a create log message.
 *
 * @return {String} message
 */
function logCreate() {
    return chalk.green('create') + ' ' + _.join(arguments, ' ');
}

function lowerCaseCompact(str) {
    return _.toLower(_.camelCase(str));
}

module.exports = {
    appendType: appendType,
    namespaceToPath: namespaceToPath,
    logCreate: logCreate,
    lowerCaseCompact: lowerCaseCompact
};
