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
    var needle = new RegExp(_.get(config, 'needle', '</synthetic>'));
    var fullPath = path.join(config.path, config.file);
    var content = fs.readFileSync(fullPath, 'utf8');

    var lines = content.split(EOL);

    // look for "well" formed synthetic closing tag...
    var syntheticClosingTagIndex = -1;
    for (var i = _.size(lines) - 1; i >= 0; i--) {
        if (needle.test(lines[i])) {
            syntheticClosingTagIndex = i;
            break;
        }
    }

    // how to handle errors?
    if (syntheticClosingTagIndex) {
        var indent = _.get(config, 'indent', 4);
        var toInsert = _.get(config, 'type', []).map(function (line) {
            return _.repeat(' ', indent) + line;
        });

        var syntheticClosingLine = lines[syntheticClosingTagIndex];
        var breakColumn = syntheticClosingLine.indexOf(_.get(config, 'needle', '</synthetic>'));
        var deleteCount = 0;
        if (breakColumn) {
            var lineToBreak = syntheticClosingLine.substr(0, breakColumn);
            var lineFromBreak = syntheticClosingLine.substr(breakColumn);
            toInsert.unshift(lineToBreak);
            toInsert.push(lineFromBreak);
            deleteCount = 1;
        }
        lines.splice(syntheticClosingTagIndex, deleteCount, toInsert.join(EOL));

        fs.writeFileSync(fullPath, lines.join(EOL));
    }
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

function lowerCaseCompact(str) {
    return _.toLower(_.camelCase(str));
}

module.exports = {
    appendType: appendType,
    namespaceToPath: namespaceToPath,
    lowerCaseCompact: lowerCaseCompact
};
