'use strict';

(function () {

    angular.module('tournamentApp').factory('Team', ['$http', '$q', 'Cookies', 'Phase', 'Division', function ($http, $q, Cookies, Phase, Division) {

        var service = this;

        var teams = [];

        var phases = Phase.phases;
        var divisions = Division.divisions;

        service.teamFactory = {
            teams: teams,
            postTeam: postTeam,
            getTeams: getTeams,
            getTeamById: getTeamById,
            deleteTeam: deleteTeam,
            editTeamName: editTeamName,
            editTeamPlayerName: editTeamPlayerName,
            updateTeamDivisions: updateTeamDivisions,
            addPlayer: addPlayer,
            deletePlayer: deletePlayer
        };

        function postTeam(tournamentId, team) {
            return $q(function (resolve, reject) {
                var formattedTeam = formatNewTeam(team);
                var body = {
                    team: formattedTeam,
                    token: Cookies.get('nfToken')
                };
                $http.post('/api/t/' + tournamentId + '/teams', body).then(function (_ref) {
                    var data = _ref.data;

                    getTeams(tournamentId);
                    resolve(data.team.team.name);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function getTeams(tournamentId) {
            var token = Cookies.get('nfToken');
            $http.get('/api/t/' + tournamentId + '/teams?token=' + token).then(function (_ref2) {
                var data = _ref2.data;

                var formattedTeams = data.teams.map(function (_ref3) {
                    var id = _ref3.team_id;
                    var name = _ref3.name;
                    var _ref3$team_divisions = _ref3.team_divisions;
                    var team_divisions = _ref3$team_divisions === undefined ? [] : _ref3$team_divisions;

                    return {
                        id: id,
                        name: name,
                        divisions: team_divisions === null ? {} : team_divisions.reduce(function (phaseMap, current) {
                            phaseMap[current.phase_id] = current.division_id;
                            return phaseMap;
                        }, {})
                    };
                });
                angular.copy(formattedTeams, service.teamFactory.teams);
            }).catch(function (error) {
                return reject(error);
            });
        }

        function getTeamById(tournamentId, teamId) {
            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                $http.get('/api/t/' + tournamentId + '/teams/' + teamId + '?token=' + token).then(function (_ref4) {
                    var data = _ref4.data;
                    var _data$result = data.result;
                    var name = _data$result.name;
                    var id = _data$result.id;
                    var players = _data$result.players;
                    var divisions = _data$result.team_divisions;
                    var addedBy = _data$result.added_by;
                    var games = _data$result.games_count;

                    var formattedTeam = {
                        name: name,
                        newName: name,
                        id: id,
                        players: players.map(function (_ref5) {
                            var name = _ref5.player_name;
                            var id = _ref5.player_id;
                            var addedBy = _ref5.added_by;
                            var games = _ref5.games;

                            return {
                                name: name,
                                newName: name,
                                id: id,
                                addedBy: addedBy,
                                games: games
                            };
                        }),
                        mappedDivisions: divisions.reduce(function (aggr, current) {
                            aggr[current.phase_id] = current.division_id;
                            return aggr;
                        }, {}),
                        addedBy: addedBy,
                        games: games
                    };
                    resolve(formattedTeam);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function editTeamName(tournamentId, teamId, teamName) {
            return $q(function (resolve, reject) {
                var body = {
                    token: Cookies.get('nfToken'),
                    name: teamName
                };
                $http.put('/api/t/' + tournamentId + '/teams/' + teamId, body).then(function (_ref6) {
                    var data = _ref6.data;
                    var _data$result2 = data.result;
                    var id = _data$result2.id;
                    var name = _data$result2.name;

                    updateTeamNameInArray(id, name);
                    resolve(name);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function updateTeamDivisions(tournamentId, teamId, phaseDivisionMap, divisions) {
            return $q(function (resolve, reject) {
                var body = {
                    token: Cookies.get('nfToken'),
                    divisions: divisions
                };
                $http.put('/api/t/' + tournamentId + '/teams/' + teamId + '/divisions', body).then(function (_ref7) {
                    var data = _ref7.data;

                    updateTeamDivisionsInArray(teamId, phaseDivisionMap);
                    resolve();
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function editTeamPlayerName(tournamentId, playerId, name) {
            return $q(function (resolve, reject) {
                var body = {
                    token: Cookies.get('nfToken'),
                    name: name
                };
                $http.put('/api/t/' + tournamentId + '/players/' + playerId, body).then(function (_ref8) {
                    var data = _ref8.data;

                    resolve(data.result.name);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function addPlayer(tournamentId, teamId, newPlayerName) {
            return $q(function (resolve, reject) {
                var body = {
                    token: Cookies.get('nfToken'),
                    name: newPlayerName,
                    team: teamId
                };
                $http.post('/api/t/' + tournamentId + '/players', body).then(function (_ref9) {
                    var data = _ref9.data;
                    return resolve(data.result);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function deletePlayer(tournamentId, playerId) {
            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                $http.delete('/api/t/' + tournamentId + '/players/' + playerId + '?token=' + token).then(function (_ref10) {
                    var data = _ref10.data;
                    return resolve(data.result.id);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function deleteTeam(tournamentId, teamId) {
            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                $http.delete('/api/t/' + tournamentId + '/teams/' + teamId + '?token=' + token).then(function (_ref11) {
                    var data = _ref11.data;

                    deleteTeamFromArray(data.result.id);
                    resolve();
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function formatNewTeam(team) {
            var formattedTeam = {};
            formattedTeam.players = team.players.filter(function (player) {
                return player.name.trim().length > 0;
            });
            formattedTeam.name = team.name.trim();
            formattedTeam.divisions = Object.keys(team.divisions).map(function (phase) {
                return team.divisions[phase].id;
            });

            return formattedTeam;
        }

        function updateTeamNameInArray(id, name) {
            var index = service.teamFactory.teams.findIndex(function (team) {
                return team.id === id;
            });
            if (index !== -1) {
                service.teamFactory.teams[index].name = name;
            }
        }

        function updateTeamDivisionsInArray(id, divisions) {
            var index = service.teamFactory.teams.findIndex(function (team) {
                return team.id === id;
            });
            if (index !== -1) {
                service.teamFactory.teams[index].divisions = divisions;
            }
        }

        function deleteTeamFromArray(teamId) {
            var index = service.teamFactory.teams.findIndex(function (team) {
                return team.id === teamId;
            });
            service.teamFactory.teams.splice(index, 1);
        }

        return service.teamFactory;
    }]);
})();