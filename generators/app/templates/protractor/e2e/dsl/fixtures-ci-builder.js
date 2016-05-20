'use strict';

var getReleaseEntities = (function () {

    const RELEASE_TYPE = 'xlrelease.Release';
    const PHASE_TYPE = 'xlrelease.Phase';
    const TEAM_TYPE = 'xlrelease.Team';
    const TASK_TYPE = 'xlrelease.Task';
    const COMMENT_TYPE = 'xlrelease.Comment';
    const CONDITION_TYPE = 'xlrelease.GateCondition';
    const DEPENDENCY_TYPE = 'xlrelease.Dependency';
    const LOG_TYPE = 'xlrelease.ActivityLogEntry';
    const LINK_TYPE = 'xlrelease.Link';
    const ATTACHMENT_TYPE = 'xlrelease.Attachment';
    const DASHBOARD_TYPE = 'xlrelease.Dashboard';
    const DEFAULT_TASK_OWNER = 'admin';

    var getTaskEntities = function (task, containerEntity, index) {
        var entities = [];

        var taskEntity = _.omit(task, 'comments', 'tasks');
        if (taskEntity.type === undefined) taskEntity.type = TASK_TYPE;
        taskEntity.id = taskEntity.id ? taskEntity.id : containerEntity.id + '/Task' + index;
        if (taskEntity.owner === undefined) taskEntity.owner = DEFAULT_TASK_OWNER;
        if (taskEntity.owner === null) delete taskEntity.owner;
        entities.push(taskEntity);

        _.each(task.conditions, function (condition, index) {
            condition.type = CONDITION_TYPE;
            condition.id = taskEntity.id + '/GateCondition' + index;
            entities.push(condition);
        });
        _.each(task.dependencies, function (dependency, index) {
            dependency.type = DEPENDENCY_TYPE;
            dependency.id = taskEntity.id + '/Dependency' + index;
            entities.push(dependency);
        });
        _.each(task.links, function (link, index) {
            link.type = LINK_TYPE;
            link.id = taskEntity.id + '/Link' + index;
            entities.push(link);
        });
        _.each(task.comments, function (comment, index) {
            comment.type = COMMENT_TYPE;
            comment.id = taskEntity.id + '/Comment' + index;
            entities.push(comment);
        });
        _.each(task.tasks, function (subTask, index) {
            entities = _.union(entities, getTaskEntities(subTask, taskEntity, index));
        });
        _.each(task.templateVariables, function (variable, index) {
            entities.push(_.extend(getVariableEntity(variable.value, variable.key, taskEntity.id, index), variable));
        });
        if ('pythonScript' in task) {
            var pythonScript = task.pythonScript;
            pythonScript.id = taskEntity.id + '/PythonScript';
            pythonScript.customScriptTask = taskEntity.id;
            entities.push(pythonScript);
        }
        return entities;
    };

    var getPhaseEntities = function (phase, releaseEntity, index) {
        var entities = [];

        var phaseEntity = _.omit(phase, 'tasks');
        phaseEntity.type = PHASE_TYPE;
        phaseEntity.id = releaseEntity.id + '/Phase' + index;
        entities.push(phaseEntity);

        _.forEach(phase.tasks, function (task, index) {
            entities = _.union(entities, getTaskEntities(task, phaseEntity, index));
        });

        return entities;
    };

    var getVariableEntity = function (value, key, containerId, index, password) {
        var rv = {};
        var keyNoSyntax = key.replace('${', '').replace('}', '');
        rv.id = containerId + '/Variable' + index;
        rv.key = keyNoSyntax;
        rv.requiresValue = true;
        rv.showOnReleaseStart = true;
        rv.type = password ? 'xlrelease.PasswordStringVariable' : 'xlrelease.StringVariable';
        if (value) {
            rv.value = value;
        }
        return rv;
    };

    function getDashboardEntities(dashboard, releaseId) {
        let entities = [{
            id: `${releaseId}/summary`,
            type: DASHBOARD_TYPE
        }];
        if (dashboard.tiles) {
            _.forEach(dashboard.tiles, function (tile, index) {
                entities.push(getTileEntity(tile, `${releaseId}/summary`, index));
            })
        }
        return entities;
    }

    function getTileEntity(tile, containerId, index) {
        tile.id = tile.id || `${containerId}/Tile${index}`;
        return tile;
    }

    return function (release) {
        var entities = [];

        var releaseEntity = _.omit(release, 'phases', 'teams', 'variables', 'summary');
        releaseEntity.type = RELEASE_TYPE;
        releaseEntity.id = 'Applications/' + releaseEntity.id;
        if (releaseEntity.startDate) {
            releaseEntity.queryableStartDate = releaseEntity.startDate;
        } else if (releaseEntity.scheduledStartDate) {
            releaseEntity.queryableStartDate = releaseEntity.scheduledStartDate;
        }
        if (releaseEntity.endDate) {
            releaseEntity.queryableEndDate = releaseEntity.endDate;
        } else if (releaseEntity.dueDate) {
            releaseEntity.queryableEndDate = releaseEntity.dueDate;
        }
        if (releaseEntity.owner === undefined) {
            releaseEntity.owner = 'admin';
        }
        entities.push(releaseEntity);

        _.forEach(release.phases, function (phase, index) {
            entities = _.union(entities, getPhaseEntities(phase, releaseEntity, index));
        });
        _.forEach(release.teams, function (team, index) {
            team.type = TEAM_TYPE;
            team.id = releaseEntity.id + '/Team' + index;
            entities.push(team);
        });
        _.forEach(release.attachments, function (attachment, index) {
            attachment.type = ATTACHMENT_TYPE;
            attachment.id = releaseEntity.id + '/Attachment' + index;
            entities.push(attachment);
        });
        _.forEach(release.variables, function (variable, index) {
            entities.push(_.extend(getVariableEntity(variable.value, variable.key, releaseEntity.id, index), variable));
        });

        if (release.summary) {
            entities = _.union(entities, getDashboardEntities(release.summary, releaseEntity.id));
        }

        return entities;
    };
})();

global.getReleaseEntities = getReleaseEntities;
