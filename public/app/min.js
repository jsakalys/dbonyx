var app=angular.module("dbonyx",["AuctionCtrls","ItemCtrls","MenuCtrls","UserCtrls","ngRoute","ngCookies"]);app.config(["$routeProvider","$locationProvider",function(e,t){e.when("/",{templateUrl:"app/views/index.html"}).when("/about",{templateUrl:"app/views/about.html"}).when("/auctions",{templateUrl:"app/views/auctions.html"}).when("/database",{templateUrl:"app/views/database.html"}).when("/character",{templateUrl:"app/views/character.html"}).when("/character/main",{templateUrl:"app/views/characterMain.html"}).when("/character/reputation",{templateUrl:"app/views/characterReputation.html"}).when("/character/achievements",{templateUrl:"app/views/characterAchievements.html"}).when("/character/mounts",{templateUrl:"app/views/characterMounts.html"}).when("/character/battlepets",{templateUrl:"app/views/characterBattlepets.html"}).when("/character/professions",{templateUrl:"app/views/characterProfessions.html"}).when("/character/pvp",{templateUrl:"app/views/characterPvp.html"}).when("/character/:characterName",{templateUrl:"app/views/character.html"}).when("/feedback",{templateUrl:"app/views/feedback.html"}).when("/item/:id",{templateUrl:"app/views/item.html"}).when("/mount/:id",{templateUrl:"app/views/mount.html"}).when("/profile",{controller:"userCtrl",templateUrl:"app/views/profile.html"}).when("/register",{templateUrl:"app/views/register.html"}).when("/validate/:user/:validateString",{templateUrl:"app/views/validate.html"}).otherwise({templateUrl:"app/views/404.html"}),t.html5Mode(!0)}]).factory("onyxPersistence",["$cookies",function(e){var t,r={},a={};return r.setRealm=function(r){t=r,e.put("realm",r)},r.getRealm=function(){return t||e.get("realm")||""},r.set=function(t,r){a[t]=r,e.put(t,r)},r.get=function(t){return a[t]||e.get(t)||""},r}]).controller("characterCtrl",["onyxPersistence","onyxCharacter","$scope","$http","$location","$routeParams",function(e,t,r,a,n,i){r.character=t,r.search=function(e){e&&e.preventDefault;var t=i.characterName||r.characterName||"",a=r.realmInput||!1;r.character.search(t,a,function(e){e?1===e.count?n.url("/character/main"):r.results=e:r.error="Unable to find character."})},r.selectCharacter=function(a){t.setCharacter(r.results[a]),e.set("characterName",r.results[a].name),e.set("characterRealm",r.results[a].realm),e.set("characterRegion",r.results[a].region.toUpperCase()),$window.location.href="/character/main"},r.realmInput=e.get("characterRealm")+"-"+e.get("characterRegion"),r.characterName=e.get("characterName"),i.characterName&&(e.set("characterName",i.characterName),r.characterName=e.get("characterName"),r.search())}]).controller("characterMain",["onyxPersistence","onyxCharacter","$scope",function(e,t,r){r.character=t,r.character.get("items"),r.character.get("mounts"),r.character.get("achievements"),r.character.get("reputation")}]).controller("characterProfessions",["onyxCharacter","$scope",function(e,t){t.character=e,t.character.get("professions"),t.expandRecipes=[!1,!1,!1,!1,!1,!1],t.expandToggle=function(e){t.expandRecipes[e]=!t.expandRecipes[e]}}]).controller("mountCtrl",["$scope","$routeParams","$http",function(e,t,r){e.mountId=parseInt(t.id),e.mount={},e.loading=!0,e.mountId&&r({method:"GET",url:"/api/mount/"+e.mountId}).then(function(t){e.mount=t.data.mount},function(e){})}]).controller("feedbackCtrl",["$http","$scope",function(e,t){t.sendFeedback=function(){t.error="",t.message&&t.title?e({url:"/api/user/feedback",method:"POST",data:{title:t.title,message:t.message}}).then(function(e){t.success="Your message has been sent successfully!"},function(e){t.error="There was an error sending your message, please try again."}):t.error="Please provide a title and a message."}}]).factory("onyxCharacter",["$http","onyxPersistence",function(e,t){var r={},a=[];return r.loaded=!1,r.setCharacter=function(e){for(key in e)r[key]=e[key]},r.runOnLoad=function(){for(var e=0;e<a.length;e++)r.get(a[e])},r.search=function(a,n,i){if(r.loading=!0,!a)return r.loading=!1,void i(!1);var o={name:a};n&&(o.realm=n),e({method:"GET",url:"/api/character/load",params:o}).then(function(e){1===e.data.count?(t.set("characterName",a),t.set("characterRealm",e.data.character.realm),t.set("characterRegion",e.data.character.region),r.setCharacter(e.data.character),r.loading=!1,r.loaded=!0,r.runOnLoad(),i(e.data)):(r.loading=!1,i(e.data.characters))},function(e){r.loading=!1,t.set("characterName",""),i(!1)})},r.get=function(t){if(!r.loaded)return void a.push(t);if(!r[t]){if(!r.name||!r.realm||!r.region)return;var n={name:r.name,realm:r.realm,region:r.region};e({method:"GET",url:"/api/character/"+t,params:n}).then(function(e){r[t]=e.data[t]},function(e){})}},r.init=function(){var e=t.get("characterName"),a=t.get("characterRealm"),n=t.get("characterRegion"),i=a+"-"+n;"string"==typeof e&&""!==e&&r.search(e,i,function(e){})},r.init(),r}]).controller("watchlistCtrl",["$scope","$http",function(e,t){var r=function(){t({method:"GET",url:"/api/watchlist/"}).then(function(t){e.watchlists=t.data.watchlists},function(e){})};r(),e.watchlists=[]}]).directive("sidebar",[function(){return{restrict:"E",replace:!0,transclude:!0,templateUrl:"app/templates/sidebar.html"}}]).directive("mainContent",[function(){return{restrict:"E",replace:!0,transclude:!0,templateUrl:"app/templates/mainContent.html"}}]).directive("onyxFooter",[function(){return{templateUrl:"app/templates/footer.html"}}]),angular.module("AuctionCtrls",[]).factory("auctionService",["$http",function(e){var t={searchTerm:"",realmInput:"",filters:{qualities:[]},sortBy:"buyout",sortOrder:-1,resultPages:0,currentPage:1,resultHigh:0,resultLow:0,limit:25,loading:!1,auctionResults:[]};return t.setSearchTerm=function(e){t.searchTerm=e},t.setRealm=function(e){t.realmInput=e},t.search=function(r){t.realmInput&&e({method:"GET",url:"/api/auction/fetchauctions",params:{filters:t.filters,searchTerm:t.searchTerm,realm:t.realmInput,offset:(t.currentPage-1)*t.limit,limit:t.limit,sortBy:t.sortBy,sortOrder:t.sortOrder}}).then(function(e){t.loading=!1,t.auctionResults=e.data,t.resultPages=Math.ceil(t.auctionResults.count/t.limit),t.resultLow=(t.currentPage-1)*t.limit,t.resultHigh=t.resultLow+t.auctionResults.auctions.length,r(!0)},function(e){t.loading=!1,r(!1)})},t.updatePage=function(e){e=parseInt(e),e>t.resultPages&&(e=t.resultPages),1>e&&(e=1),t.currentPage=e},t.firstPage=function(){t.updatePage(1)},t.backPage=function(){t.updatePage(t.currentPage-1)},t.nextPage=function(){t.updatePage(t.currentPage+1)},t.lastPage=function(){t.updatePage(t.resultPages)},t}]).controller("AuctionCtrl",["$scope","$http","$location","$routeParams","onyxPersistence","auctionService",function(e,t,r,a,n,i){var o=r.search();e.searchTerm=o.s||"",e.realmInput=o.r||n.getRealm()||"",e.realms=[],e.auctionResults=i.auctionResults,e.loading=!1,e.filters=i.filters,e.updatePages=function(){e.backPages=[],e.nextPages=[],e.low=i.resultLow,e.high=i.resultHigh;for(var t=i.currentPage-5;t<i.currentPage;t++)t>0&&e.backPages.push(t);for(var t=i.currentPage+1;t<=i.currentPage+5;t++)t<=i.resultPages&&e.nextPages.push(t);e.currentPage=i.currentPage},e.updatePage=function(t){i.updatePage(t),e.search()},e.firstPage=function(){i.firstPage(),e.search()},e.nextPage=function(){i.nextPage(),e.search()},e.backPage=function(){i.backPage(),e.search()},e.lastPage=function(){i.lastPage(),e.search()},e.clearQualityFilter=function(){e.filters.qualities=[],e.firstPage()};var c=function(t){e.loading=!1,e.auctionResults=i.auctionResults,e.updatePages()};e.search=function(t){t&&t.preventDefault(),e.loading=!0,i.filters=e.filters,i.setSearchTerm(e.searchTerm),i.setRealm(e.realmInput),i.search(c)},e.search()}]).directive("selectOnFocus",["$window",function(e){return{restrict:"A",link:function(t,r,a){r.on("focus",function(){e.getSelection().toString()||this.setSelectionRange(0,this.value.length)})}}}]).directive("auctionResult",function(){var e=["$scope",function(e){e.toggleHistory=function(){e.showAuctionHistory=!e.showAuctionHistory}}];return{restrict:"E",replace:!0,controller:e,templateUrl:"app/templates/auctionResult.html"}}).directive("watchlistForm",function(){var e=["$scope","$http","onyxUser",function(e,t,r){e.user=r,e.minQuantity=1,e.item?e.maxQuantity=e.item.stackable||9999:e.maxQuantity=9999,e.price||(e.price=0),e.originalPrice=e.price,e.gold=Math.floor(e.price/1e4),e.silver=Math.floor(e.price%1e4/100),e.copper=e.price%100,e.submit=function(){var r=parseInt(e.copper+100*e.silver+1e4*e.gold);t({method:"POST",url:"/api/watchlist",data:{price:r,item:e.item._id,min:e.minQuantity,max:e.maxQuantity,realm:e.realmInput}}).then(function(e){},function(e){})}}];return{restrict:"E",controller:e,scope:{item:"=",price:"@",showWatchlist:"=",realmInput:"="},templateUrl:"app/templates/watchlist.html"}}).directive("autoComplete",function(){var e=["onyxPersistence","$scope","$http",function(e,t,r){t.realmInputSelected=!1,t.realms=[],t.blurIn=function(e){0==t.realms.length&&t.getRealms(),t[e]=!0},t.blurOut=function(e){t[e]=!1},t.getRealms=function(){t.realms=["Loading Realms"],r({method:"GET",url:"/api/realms"}).then(function(e){t.realms=e.data},function(e){t.realms=["Unable to Load Realms"]})},t.selectRealm=function(r){t.realmInput=r,e.setRealm(r),setTimeout(t.search,0)},t.hover=function(e){t.hoverIndex=e}}];return{restrict:"E",replace:!0,scope:{realmInput:"=",search:"&"},templateUrl:"app/templates/autoComplete.html",controller:e}}).directive("money",function(){var e=["$scope",function(e){e.amount=parseInt(e.amount),e.copper=e.amount%100,e.silver=parseInt(e.amount/100)%100,e.gold=parseInt(e.amount/1e4)}];return{restrict:"E",replace:!0,scope:{amount:"="},templateUrl:"app/templates/money.html",controller:e}}).directive("auctionHistory",function(){var e=["$scope","auctionHistory",function(e,t){e.item&&t.search(e.item._id,e.realmInput,function(t,r){if(e.aucHistoryLoading=!1,t||!r)return t;e.histories=r.histories,e.count=e.histories.length,e.barwidth=Math.floor(480/e.count),e.barheight=280,e.width=e.barwidth*e.count;for(var a=0;a<e.histories.length;a++){var n=parseInt(e.histories[a].sellingPrice/e.histories[a].sold);e.histories[a].x=e.barwidth*a,e.histories[a].y=e.barheight-(e.barheight-25)*n/r.max,e.histories[a].averagePrice=n,e.histories[a].soldy=e.barheight+(40-40*(e.histories[a].sold/r.maxQuantity)),e.histories[a].soldheight=40*(e.histories[a].sold/r.maxQuantity),e.histories[a].expiredheight=40*(e.histories[a].expired/r.maxQuantity),e.histories[a].expiredy=e.histories[a].soldy-e.histories[a].expiredheight,console.log(e.histories[a].expiredheight,e.histories[a].soldheight),console.log(e.histories[a].expiredy,e.histories[a].soldy)}}),e.aucHistoryLoading=!0,e.hoverIn=function(t){e.histories[t].selected=!0,e.selected=e.histories[t]},e.hoverOut=function(t){e.histories[t].selected=!1,e.selected=!1}}];return{restrict:"E",controller:e,scope:{item:"=",showAuctionHistory:"&",realmInput:"="},templateUrl:"app/templates/auctionHistory.html"}}).factory("auctionHistory",["$http",function(e){var t={};return t.search=function(t,r,a){e({method:"GET",url:"/api/auction/auctionHistory",params:{item:t,realm:r}}).then(function(e){a(null,e.data)},function(e){a(e.data,null)})},t}]),angular.module("ItemCtrls",[]).factory("itemService",["$http",function(e){var t={};return t.getItem=function(t,r,a){var n=parseInt(t);e({method:"GET",url:"/api/item/pretty/"+n,modifiers:r}).then(function(e){var t=e.data.item;a(t)},function(e){a(!1)})},t.prettify=function(e){},t}]).controller("itemCtrl",["$scope","$http","$location","$routeParams",function(e,t,r,a){e.id=a.id}]).directive("itemDisplay",function(){var e=["$scope","itemService",function(e,t){e.getItem=function(){e.item="Loading",e.loading=!0,t.getItem(e.itemId,{},function(t){e.item=t,e.loading=!1})},e.getItem()}];return{controller:e,restrict:"E",replace:!0,scope:{itemId:"@"},templateUrl:"app/templates/itemDisplay.html"}}).directive("itemLink",[function(){var e=["$scope",function(e){e.quantity&&1!==parseInt(e.quantity)&&(e.showQuantity=!0)}];return{controller:e,scope:{item:"=",quantity:"@"},replace:!0,templateUrl:"app/templates/itemLink.html"}}]),angular.module("UserCtrls",[]).factory("onyxUser",["$http",function(e){var t={loggedin:!1};return t.checkLoggedInStatus=function(){e({method:"POST",url:"/api/user/getUser"}).then(function(e){t.username=e.data.username,t.loggedin=!0},function(e){})},t.validateUser=function(t,r,a){e({method:"POST",url:"/api/user/validate",data:{username:t,validateString:r}}).then(function(e){return console.log("Success!"),e},function(e){return a("There was an error validating your email.")})},t.login=function(r,a,n){console.log("a"),e({method:"POST",url:"/api/user/login",data:{email:r,password:a}}).then(function(e){t.username=e.data.username,t.email=e.data.email,t.loggedin=!0,n(null,!0)},function(e){n(e.data.error,!1)})},t.logout=function(){e({method:"POST",url:"/api/user/logout"}).then(function(e){t.username="",t.email="",t.loggedin=!1},function(e){})},t.register=function(r,a,n,i,o){e({method:"POST",url:"/api/user/register",data:{username:r,email:a,password1:n,password2:i}}).then(function(e){return t.username="",t.email="",t.loggedin=!1,o(!0)},function(e){return o(null,e.data.error)})},t.checkLoggedInStatus(),t}]).controller("validateCtrl",["$http","$location","$scope","$routeParams","onyxUser",function(e,t,r,a,n){n.validateUser(a.user,a.validateString,function(e){r.error=e})}]).controller("userCtrl",["onyxUser","$scope","$http","$location",function(e,t,r,a){t.user=e,t.showRegisterForm=!1,t.showUserPanel=!1,t.showRegisterForm=!1,t.toggleRegister=function(){t.showRegisterForm=!t.showRegisterForm},t.login=function(){e.login(t.login.email,t.login.password,function(e,r){e&&(t.error=e),t.showRegisterForm=!1})},t.logout=function(){e.logout(),t.showUserPanel=!1},t.toggleUserPanel=function(){t.showUserPanel=!t.showUserPanel},t.register=function(){e.register(t.username,t.email,t.password1,t.password2,function(e,r){e?(t.success="Registered Successfully!",t.toggleRegister()):r&&(t.registerError=r)})},t.clearError=function(){t.error=!1,t.registerError=!1,t.success=!1}}]).directive("userRegisterForm",[function(){return{restrict:"E",replace:!0,templateUrl:"app/templates/userRegisterForm.html"}}]).directive("userPanel",[function(){return{restrict:"E",replace:!0,templateUrl:"app/templates/userPanel.html"}}]),angular.module("MenuCtrls",[]).controller("MenuCtrl",["$scope",function(e){}]).directive("menuBar",[function(){var e=["$scope",function(e){var t;e.menus=[],this.select=e.select=function(t){e.hover=t,angular.forEach(e.menus,function(e){e.selected=!1}),t.selected=!0,e.menuSelected=!0},this.off=e.off=function(){e.hover=!1,t=setTimeout(function(){e.hover||(e.menuSelected=!1,e.$apply())},500)},this.addMenu=function(t){e.menus.push(t)}}];return{restrict:"E",transclude:!0,scope:{},controller:e,templateUrl:"app/templates/menuBar.html"}}]).directive("menu",[function(){return{require:"^^menuBar",restrict:"E",transclude:!0,scope:{title:"@",link:"@"},link:function(e,t,r,a){a.addMenu(e)},templateUrl:"app/templates/menu.html"}}]);