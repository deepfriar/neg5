'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _db = require('../database/db');

var _sql = require('../database/sql');

var _sql2 = _interopRequireDefault(_sql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var statSQL = _sql2.default.statistics;
var phaseSQL = _sql2.default.phase;
var tournamentSQL = _sql2.default.tournament;
var divisionSQL = _sql2.default.division;

function formatStatisticsResults(result) {
  return {
    phase: result[0][0] || { name: 'All Phases', id: null },
    pointScheme: result[2].tossup_point_scheme.sort(function (first, second) {
      return second.value - first.value;
    }),
    tournamentName: result[2].name,
    activePhaseId: result[2].active_phase_id,
    stats: result[1]
  };
}

exports.default = {

  individualReport: function individualReport(tournamentId) {
    var phaseId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    return new Promise(function (resolve, reject) {
      var queriesArray = [];
      queriesArray.push({
        text: phaseSQL.findById,
        params: [tournamentId, phaseId],
        queryType: _db.txMap.any
      }, {
        text: statSQL.individual,
        params: [tournamentId, phaseId],
        queryType: _db.txMap.any
      }, {
        text: tournamentSQL.findById,
        params: [tournamentId],
        queryType: _db.txMap.one
      });
      (0, _db.transaction)(queriesArray).then(function (result) {
        var formattedResult = formatStatisticsResults(result);
        resolve(formattedResult);
      }).catch(function (error) {
        return reject(error);
      });
    });
  },

  teamReport: function teamReport(tournamentId) {
    var phaseId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    return new Promise(function (resolve, reject) {
      var queriesArray = [];
      queriesArray.push({
        text: phaseSQL.findById,
        params: [tournamentId, phaseId],
        queryType: _db.txMap.any
      }, {
        text: phaseId ? statSQL.teamGivenPhase : statSQL.teamDefaultPhase,
        params: phaseId ? [tournamentId, phaseId] : [tournamentId],
        queryType: _db.txMap.any
      }, {
        text: tournamentSQL.findById,
        params: [tournamentId],
        queryType: _db.txMap.one
      }, {
        text: divisionSQL.findByTournament,
        params: [tournamentId],
        queryType: _db.txMap.any
      });
      (0, _db.transaction)(queriesArray).then(function (result) {
        var formattedResult = formatStatisticsResults(result);
        if (phaseId) {
          formattedResult.divisions = result[3].filter(function (d) {
            return d.phase_id === result[0][0].id;
          });
        } else {
          formattedResult.divisions = result[3].filter(function (d) {
            return d.phase_id === result[2].active_phase_id;
          });
        }
        resolve(formattedResult);
      }).catch(function (error) {
        return reject(error);
      });
    });
  },

  teamFullReport: function teamFullReport(tournamentId) {
    var phaseId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    return new Promise(function (resolve, reject) {
      var queriesArray = [];
      queriesArray.push({
        text: phaseSQL.findById,
        params: [tournamentId, phaseId],
        queryType: _db.txMap.any
      }, {
        text: statSQL.teamFull,
        params: [tournamentId, phaseId],
        queryType: _db.txMap.any
      }, {
        text: tournamentSQL.findById,
        params: [tournamentId],
        queryType: _db.txMap.one
      });
      (0, _db.transaction)(queriesArray).then(function (result) {
        return resolve(formatStatisticsResults(result));
      }).catch(function (error) {
        return reject(error);
      });
    });
  },

  playerFullReport: function playerFullReport(tournamentId) {
    var phaseId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    return new Promise(function (resolve, reject) {
      var queriesArray = [];
      queriesArray.push({
        text: phaseSQL.findById,
        params: [tournamentId, phaseId],
        queryType: _db.txMap.any
      }, {
        text: statSQL.playerFull,
        params: [tournamentId, phaseId],
        queryType: _db.txMap.any
      }, {
        text: tournamentSQL.findById,
        params: [tournamentId],
        queryType: _db.txMap.one
      });
      (0, _db.transaction)(queriesArray).then(function (result) {
        return resolve(formatStatisticsResults(result));
      }).catch(function (error) {
        return reject(error);
      });
    });
  },

  roundReport: function roundReport(tournamentId) {
    var phaseId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    return new Promise(function (resolve, reject) {
      var queriesArray = [];
      queriesArray.push({
        text: phaseSQL.findById,
        params: [tournamentId, phaseId],
        queryType: _db.txMap.any
      }, {
        text: statSQL.roundReport,
        params: [tournamentId, phaseId],
        queryType: _db.txMap.any
      }, {
        text: tournamentSQL.findById,
        params: [tournamentId],
        queryType: _db.txMap.one
      });
      (0, _db.transaction)(queriesArray).then(function (result) {
        return resolve(formatStatisticsResults(result));
      }).catch(function (error) {
        return reject(error);
      });
    });
  }
};