/**
 *
 * 
 NOTE 1 :-"sm-candidateprofile" module can be found in root folder smcandidateprofile.js
      2 :-navCtrl controller is reponsible for displayed the navbar and uses 
        $rootScope, $scope, datagenerate, $state, $auth as dependencies
      3 :-datagenerate dependency is a factory and can be found in applayout/services/languagechange.js
 *
 */

angular.module("sm-candidateprofile")
    .controller('navCtrl', ['Flash', '$rootScope', '$scope', 'datagenerate', '$state', '$auth', '$timeout', '$mdSidenav',  function(Flash, $rootScope, $scope, datagenerate, $state, $auth, $timeout, $mdSidenav) {

        /* Global element signout exists in the root scope of the application and is used to control
        the visiblility of the signout button in the navbar */
        $rootScope.signout = false;
        $scope.sideNavLogo = true;

        /* loggedinbackground is defined in rootscope and sets the classname for the content ui-view declared
        in index.html dynamically .
        NOTE :- classes with required is defined in applayout/css/applayout.css
        */
        $rootScope.loggedinbackground = "loggedoutbackground";

        //loadnavlang() function is used to get the data from resources.json file in language object
        $scope.loadnavlang = function() {

            /* getjson() function is defined in factory datagenerate */

            datagenerate.getjson("nav", "language").then(function(result) {

                $rootScope.language = {};


                for (key in result[0]) {
                    $rootScope.language[key] = result[0][key];
                };
            }); //end datagenerate
        };

        $scope.loadnavlang(); // calling loadnavlang  for loading data initially

        /*logout() function which will be actually called in the associated view for 
        loggin out the user*/
        $scope.logout = function() {
            /*$auth.logout() is a predefined function provided by satellizer for destroying session or 
            deleting JWT of the user. */
            $auth.logout();
            $scope.sideNavLogo = false;
            $rootScope.signout = false; // resetting the visibility of the flag to hide signout button on logout
            $rootScope.loggedinbackground = "loggedoutbackground"; // resetting the visibility of the content view backgound  in index.html
            $state.go('candidate.login'); // redirects to a mentioned state if successfull
        }; //logout ends


        //loading the section of sign in page in different language
        //the function loadLangData() is called from the different language button that display in the navbar 
        //loadLangData() is declared as $parent to make it available in child controller
        $scope.$parent.loadLangData = function(lang) {
                //datagenerate is a service that call the API to get the json data
                //datagenerate defined in -->> applayout/services/languagechange.js
                datagenerate.getjson("section", lang).then(function(result) {
                    if (result != "err") {
                        $scope.$parent.resourceData = result;
                        console.log($scope.resourceData);

                    } else {

                        $scope.loadLangData("English"); //handling the error and by default assigning the English language 

                        /* After loading default lang English flash message is displayed that language is not supported */
                        var message = 'Sorry ! Language not yet supported';
                        Flash.create('danger', message);
                    }
                });

                //for getting the header or title of project i.e "SAMARTH" in different languages 

                datagenerate.getjson("nav", lang).then(function(result) {

                    $scope.title = result.header;
                });
            }
            //on loading navctrl, calling loadLangData() function with default English language
        $scope.loadLangData("English");


        $scope.toggleLeft = buildToggler('left');
        $scope.toggleRight = buildToggler('right');

        function buildToggler(componentId) {
          return function() {
            $mdSidenav(componentId).toggle();
          }
        }
    }]);
