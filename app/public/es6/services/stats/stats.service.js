(() => {
   
   angular.module('statsApp')
        .factory('Stats', ['$http', '$q', 'Cookies', function($http, $q, Cookies) {
            
            let service = this;
            
            service.factory = {
                refreshStats,
                getQBJReport,

                playerStats: [],
                teamStats: [],
                teamFullStats: [],
                playerFullStats: [],
                roundReportStats: [],

                divisions: [],

                unassignedTeams: [],

                pointScheme: [],
                tournamentName: {},

                activePhase: {}
            }
            
            function getPlayerStats(tournamentId, phaseId = null) {
                return $q((resolve, reject) => {
                    $http.get('/api/t/' + tournamentId + '/stats/player' + (phaseId ? '?phase=' + phaseId : ''))
                        .then(({data}) => {

                            data.result.stats.forEach(stat => {
                                stat.pointMap = stat.tossup_totals.reduce((aggr, current) => {
                                    aggr[current.value] = current.total;
                                    return aggr;
                                }, {});
                            })

                            angular.copy({id: data.result.activePhaseId}, service.factory.activePhase);
                            angular.copy(data.result.stats, service.factory.playerStats);
                            angular.copy(data.result.pointScheme, service.factory.pointScheme);
                            angular.copy({name: data.result.tournamentName}, service.factory.tournamentName);

                            resolve(data.result);

                        })
                        .catch(error => reject(error));
                })
            }

            function getTeamStats(tournamentId, phaseId = null) {
                return $q((resolve, reject) => {
                    $http.get('/api/t/' + tournamentId + '/stats/team' + (phaseId ? '?phase=' + phaseId : ''))
                        .then(({data}) => {
                            data.result.stats.forEach(stat => {
                                stat.pointMap = stat.tossup_totals.reduce((aggr, current) => {
                                    aggr[current.value] = current.total;
                                    return aggr;
                                }, {});
                            })

                            angular.copy(data.result.divisions, service.factory.divisions);
                            angular.copy(data.result.stats, service.factory.teamStats);

                            setUnassignedTeams(data.result.stats, data.result.divisions);

                            resolve(data.result);
                            
                        })
                        .catch(error => reject(error));
                })
            }

            function getTeamFullStats(tournamentId, phaseId = null) {
                return $q((resolve, reject) => {
                    $http.get('/api/t/' + tournamentId + '/stats/teamfull' + (phaseId ? '?phase=' + phaseId : ''))
                        .then(({data}) => {
                            data.result.stats.forEach(stat => {
                                stat.matches.forEach(match => {
                                    match.pointMap = match.tossup_totals.reduce((aggr, current) => {
                                        aggr[current.value] = current.total;
                                        return aggr;
                                    }, {})
                                })
                            })
                            angular.copy(data.result.stats, service.factory.teamFullStats);
                            resolve();
                        })
                        .catch(error => reject(error));
                })
            }

            function getPlayerFullStats(tournamentId, phaseId = null) {
                return $q((resolve, reject) => {
                    $http.get('/api/t/' + tournamentId + '/stats/playerfull' + (phaseId ? '?phase=' + phaseId : ''))
                        .then(({data}) => {
                            data.result.stats.forEach(stat => {
                                stat.matches.forEach(match => {
                                    match.pointMap = match.tossup_totals.reduce((aggr, current) => {
                                        aggr[current.value] = current.total;
                                        return aggr;
                                    }, {})
                                })
                            })
                            angular.copy(data.result.stats, service.factory.playerFullStats);
                            resolve();
                        })
                        .catch(error => reject(error));
                })
            }

            function getRoundReport(tournamentId, phaseId = null) {
                return $q((resolve, reject) => {
                    $http.get('/api/t/' + tournamentId + '/stats/roundreport' + (phaseId ? '?phase=' + phaseId : ''))
                        .then(({data}) => {
                            angular.copy(data.result.stats, service.factory.roundReportStats);
                            resolve();
                        })
                        .catch(error => reject(error));
                })
            }
            
            function getQBJReport(tournamentId) {
                return $q((resolve, reject) => {
                    const token = Cookies.get('nfToken');
                    $http.get('/api/t/' + tournamentId + '/qbj?token=' + token)
                        .then(({data}) => {
                            console.log(data);
                        })
                })
            }

            function refreshStats(tournamentId, phaseId) {
                return $q((resolve, reject) => {

                    $q.all([getPlayerStats(tournamentId, phaseId), getTeamStats(tournamentId, phaseId), getTeamFullStats(tournamentId, phaseId), getPlayerFullStats(tournamentId, phaseId), getRoundReport(tournamentId, phaseId)])
                        .then(() => resolve())
                        .catch(error => reject(error));
                        
                })
            }

            function setUnassignedTeams(teams, divisions) {
                let toCopy = [];
                if (divisions.length > 0) {
                    toCopy = teams.filter(team => team.division_id === null);
                }
                angular.copy(toCopy, service.factory.unassignedTeams);
            }

            return service.factory;
            
        }]); 
        
})();