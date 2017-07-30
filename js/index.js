//globally declare list of users to assess.
var users=["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas","brunofin","comster404"];
//use for JSON data request counter;
var z=0;
//to Conatin all user objects after receipt of data
var allarr=[];
//Initial value to filter results by when page loads
var filterby="All";

$(document).ready(function() {
  $("#tablestorage").append("Getting data...");
  twitchUser();
});

//first function to evaluate user existence
function twitchUser(){
  //loop thru all users
  for (var i=0;i<users.length;i++){
    //json link and call for User data
    var twitchUserJSON = "https://wind-bow.gomix.me/twitch-api/users/"+users[i]+"?callback=?";
    $.getJSON(twitchUserJSON, function(userdata) {
    //parse thru json data and create new object (uName) for each user and popluate
    if (Object.keys(userdata)[0]==="error"){
          var name=userdata["message"].split(' ')[1];
          var uName= new User(name, 0);
          }
         else{
          var name = userdata.name;
          var logo = userdata.logo;
          var uName= new User(name, 1,logo);
         }
         //pass created object to next function to retrieve channel info
         twitchChannel(uName);
      });
   }

}

//Used to extract channel information for each user
function twitchChannel(userObject){
  //json link and call for channel data
  var twitchChannelJSON = "https://wind-bow.gomix.me/twitch-api/channels/"+userObject.userName+"?callback=?";
  $.getJSON(twitchChannelJSON, function(userChannel) {
    //get url info for all existing users
    if (userObject.exists){userObject.url=userChannel["url"];}
    else{userObject.url=null;}
    //call function to make last json call for streaming info
    twitchStreaming(userObject);
  });
}
//Used to extract streaming information for each user
function twitchStreaming(userObject){
  //json link and call for streaming data
  var twitchStreamJSON = "https://wind-bow.gomix.me/twitch-api/streams/"+userObject.userName+"?callback=?";
  //note call back using p , to monitor success
  $.getJSON(twitchStreamJSON, function(userStream,p) {
    //count # of succesful callbacks
    if(p==='success'){z++;}
    //get live and status info for all users
    if(userStream['stream']){
      userObject.live=1;
      userObject.status=userStream['stream']['channel'].status;
    }
    else{
      userObject.live=0;
      userObject.status=null;
    }
    //all necessary user info is done, push into global array
    allarr.push(userObject);
    //if all users have been processed (via callback results) display information
    if(z===users.length){displayResults();}
  });
}
//displays results in table
function displayResults(){
  $("#tablestorage").empty();
  //first sort by currently streaming
  allarr.sort(function(a,b){return b.live-a.live;});
  //then sort by real users that exist
  allarr.sort(function(a,b){return b.exists-a.exists;});
  
  ///what to do when radio buttons change
  $('input:radio').change(function(){
        //change filter value
        filterby=($(this).val());  
        //rerun display of results
        displayResults();
    });
  //cases for the filter types, create new array to store filtered results keep original array
  if(filterby==="online"){
      //filter by live
      activearr= allarr.filter(function(userob){
      return (userob.live===1);
    });
  }
  else if(filterby==="offline"){
      //filter by offline
      activearr= allarr.filter(function(userob){
      return ((userob.live===0)&&(userob.exists===1));
    });
  }
  else{activearr=allarr;}
  
  //start bootstrap table construction
  var resultTable="<table class=\"table table-inverse col-md-1\"><thead></thead><tbody>";
  
  //variables for table content
  var iconPrep;
  var linkPrep;
  var status;
  for (var i=0;i<activearr.length;i++){
    //construct icon html
    if(activearr[i].iconlink){
    iconPrep="<img class=\"mobileAdjust\" src=\""+activearr[i].iconlink+"\" style=\"width:100px;height:100px;alt=\""+activearr[i].userName+"\">";}
    else{
    iconPrep="<img class=\"mobileAdjust\" src=\"https://dl.dropboxusercontent.com/s/o1lukwjeowwuuld/iconmissing.jpg?dl=0\" style=\"width:100px;height:100px;alt=\""+activearr[i].userName+"\">";
    }
    //construct link html
    if(activearr[i].url){
      if(activearr[i].live){
        linkPrep="<a style=\"color:#286b2a\" href=\""+activearr[i].url+"\" target=\"_blank\"><h3><strong>"+activearr[i].userName+"</strong></h3></a>";
      }
      else{
        linkPrep="<a href=\""+activearr[i].url+"\" target=\"_blank\"><h3>"+activearr[i].userName+"</h3></a>";
      }
    }
    else{
    linkPrep="<a href=\"#\"><h3>"+activearr[i].userName+"</h3></a>";
    }
    //construct status html
    if(!activearr[i].exists){status="User Not Found!";}
    else if(activearr[i].status){status=activearr[i].status;}
    else{status="Offline";}
    
    //construct table rows html
    if(activearr[i].live){
    resultTable+="<tr class=\"live\"><td class=\"col-md-2\">"+iconPrep+"</td><td class=\"col-md-2\">"+linkPrep+"</td><td class=\"col-md-2 mobileAdjust\">"+status+"</td></tr>";}
    else{
      resultTable+="<tr><td class=\"col-md-2\">"+iconPrep+"</td><td class=\"col-md-2\">"+linkPrep+"</td><td class=\"col-md-2 mobileAdjust\">"+status+"</td></tr>";
    }
  
  }
  //finsih table html and add result to div
  resultTable+="</tbody></table>"
  $("#tablestorage").empty()
  $("#tablestorage").append(resultTable);
  //set minor css for live streaming and other things
  $('.live').css({"background-color": "#cea173",
                 "color": "black"});
  
  $('td').css({"vertical-align": "middle",})
  //use below to adjust for small iphone as table gets too big
  if($(window).width() < 500){
    //adjusts the streaming status text-size and icon image size only
    $('.mobileAdjust').css({"font-size": "50%",
                            "width": "50px",
                            "height": "50px",
                            "vertical-align": "middle"
                           })
    //adjusts the h3 user link only
    $('h3').css({"font-size": "18px",
               "line-height": "1.3",
               "margin": "1em 0 .2em" })
    ;}
}

//function used to create iniitial object for each user
function User(userName,exists,iconLink){
	this.userName=userName;
	this.exists=exists;
	if(exists===1){
		this.iconlink=iconLink;
	}
	else{
		this.iconlink=null;
	}
}