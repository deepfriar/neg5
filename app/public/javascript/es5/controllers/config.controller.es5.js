'use strict';

(function () {
    angular.module('tournamentApp').controller('ConfigCtrl', ['$scope', '$timeout', 'Tournament', 'Game', 'Division', 'Phase', ConfigCtrl]);

    function ConfigCtrl($scope, $timeout, Tournament, Game, Division, Phase) {

        var vm = this;

        vm.editingPointScheme = false;
        vm.editingRules = false;

        vm.pointScheme = Tournament.pointScheme;
        vm.rules = Tournament.rules;

        vm.rulesCopy = {};
        vm.pointSchemeCopy = {
            tossupValues: []
        };
        vm.newPointValue = { type: null };
        vm.newDivision = { name: '' };

        vm.games = Game.games;
        vm.divisions = Division.divisions;
        vm.phases = Phase.phases;

        vm.resetPointSchemeCopyToOriginal = function () {
            angular.copy(vm.pointScheme, vm.pointSchemeCopy);
            vm.pointSchemeCopy.tossupValues.sort(function (first, second) {
                return first.value - second.value;
            });
        };

        vm.resetRules = function () {
            angular.copy(vm.rules, vm.rulesCopy);
        };

        vm.saveRules = function () {
            var sameData = angular.equals(vm.rulesCopy, vm.rules);
            if (!sameData && vm.editConfigurationRules.$valid) {
                (function () {
                    var toastConfig = { message: 'Updating rules.' };
                    Tournament.updateRules($scope.tournamentId, vm.rulesCopy).then(function () {
                        vm.resetRules();
                        toastConfig.message = 'Updated rules';
                        toastConfig.success = true;
                        vm.editingRules = false;
                    }).catch(function () {
                        toastConfig.message = 'Could not update rules';
                        toastConfig.success = false;
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            } else if (sameData && vm.editConfigurationRules.$valid) {
                vm.editingRules = false;
            }
        };

        vm.editPointScheme = function () {
            if (!duplicatePointValues() && vm.editPointSchemeForm.$valid) {
                (function () {
                    var toastConfig = {
                        message: 'Saving point values'
                    };
                    $scope.toast(toastConfig);
                    Tournament.postPointValues($scope.tournamentId, vm.pointSchemeCopy).then(function () {
                        vm.resetPointSchemeCopyToOriginal();
                        vm.editingPointScheme = false;

                        toastConfig.message = 'Saved point values';
                        toastConfig.success = true;
                    }).catch(function (error) {
                        toastConfig.message = 'Could not save point values';
                        toastConfig.success = false;
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            }
        };

        vm.addNewPointValue = function () {
            if (vm.newPointValue.type && vm.newPointValue.value && vm.newPointValueForm.$valid) {
                (function () {
                    var toastConfig = {
                        message: 'Adding point value'
                    };
                    $scope.toast(toastConfig);
                    Tournament.addPointValue($scope.tournamentId, vm.newPointValue).then(function (response) {
                        vm.resetPointSchemeCopyToOriginal();
                        toastConfig.message = 'Added point value';
                        toastConfig.success = true;
                        vm.newPointValue = {};
                    }).catch(function (error) {
                        toastConfig.message = 'Could not add point value';
                        toastConfig.success = false;
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            }
        };

        vm.removeFromPointSchemeCopy = function (point) {
            vm.pointSchemeCopy.tossupValues = vm.pointSchemeCopy.tossupValues.filter(function (ps) {
                return ps !== point;
            });
        };

        vm.saveDivision = function (division) {
            var newName = division.newName.trim();
            if (division.name.trim() !== newName && newName.length !== 0) {
                (function () {
                    var toastConfig = {
                        message: 'Saving division.'
                    };
                    var oldName = division.name;
                    $scope.toast(toastConfig);
                    Division.editDivision($scope.tournamentId, division).then(function (newName) {
                        toastConfig.success = true;
                        toastConfig.message = 'Changed division: ' + oldName + ' → ' + newName;
                    }).catch(function (error) {
                        toastConfig.success = false, toastConfig.message = 'Could not update division.';
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                        division.editing = false;
                    });
                })();
            } else {
                division.editing = false;
            }
        };

        vm.addNewDivision = function () {
            var newDivisionName = vm.newDivision.name.trim();
            if (newDivisionName.length > 0 && vm.newDivision.phaseId) {
                (function () {
                    var toastConfig = {
                        message: 'Adding division'
                    };
                    $scope.toast(toastConfig);
                    Division.addDivision($scope.tournamentId, newDivisionName, vm.newDivision.phaseId).then(function (divisionName) {
                        toastConfig.message = 'Added division: ' + divisionName;
                        toastConfig.success = true;
                        vm.resetNewDivision();
                    }).catch(function (error) {
                        toastConfig.message = 'Could not add division';
                        toastConfig.success = false;
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            }
        };

        vm.removeDivision = function (division) {
            var toastConfig = {
                message: 'Removing division.'
            };
            $scope.toast(toastConfig);
            Division.removeDivision($scope.tournamentId, division).then(function () {
                toastConfig.message = 'Removed division.';
                toastConfig.success = true;
            }).catch(function () {
                toastConfig.message = 'Could not remove division';
                toastConfig.success = false;
            }).finally(function () {
                toastConfig.hideAfter = true;
                $scope.toast(toastConfig);
            });
        };

        vm.resetNewDivision = function () {
            return vm.newDivision.name = '';
        };

        var duplicatePointValues = function duplicatePointValues() {
            var checked = {};
            for (var i = 0; i < vm.pointSchemeCopy.tossupValues.length; i++) {
                if (checked[vm.pointSchemeCopy.tossupValues[i].value]) {
                    return true;
                }
                checked[vm.pointSchemeCopy.tossupValues[i].value] = true;
            }
            return false;
        };

        $timeout(function () {
            vm.resetPointSchemeCopyToOriginal();
            vm.resetRules();
        }, 500);

        Division.getDivisions($scope.tournamentId);
    }
})();