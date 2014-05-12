/*************************************************
      SlidePanel JS v2.0
      @author Fabio Mangolini
      http://www.responsivewebmobile.com
**************************************************/
/**
(function($) {
	$.SlidePanel = function(options) {
		//default status is closed
		var status = 'close';

		//initialize the panel show/hide button 
        $('#slidein-panel-btn').css({'position': 'relative', 'top': 0, 'right':-$('#slidein-panel-btn').outerWidth()+'px'});

        //initialize the panel
        $('#slidein-panel').css({'position': 'relative', 'top': 0, 'left': -$('#slidein-panel').outerWidth(), 'height': $(window).height()});

        //show and hide the panel depending on status
		$('#slidein-panel-btn').click(
			function() {
				if(status == 'close') {
					status = 'open';
					$('#slidein-panel').animate({'left':0});
				}
				else if(status == 'open') {
					status = 'close';
					$('#slidein-panel').animate({'left':-$('#slidein-panel').outerWidth()});
				}
			}
		);
	};
})(jQuery);

Projects=new Meteor.Collection('projects');

var projectSubscription=Meteor.subscribe('myProjects');
var myTeam=Meteor.subscribe('colleagues');

Template.dashboard.helpers ({
	enterDashboard:  function() {
		Session.set("moduleName","Dashboard");
		return null;
	},
	isProjectLoaded: function () {
		return (projectSubscription.ready());
	},	
	
	projectsICanSee: function() {
		return(Projects.find({projectView: {$in: Meteor.userId()}}));
	},
	enterManageProject: function() {
		//assumes called with the session variable currentProject set to the current project id.  
		//if set to null, create a new project.
		var currProject = Session.get("currentProject");
		if (!(currProject))
				{
				newProject=Projects.insert(
					{
					projectName: "New Project",
					publicProject: defaultUserPublic,
					projectDescription:"",
					projectRevision: {major: 0, minor: 1},
					projectArchiveLinks: [],
					projectMembers: [Meteor.userId()],
					projectAdministrators: [Meteor.userId()],
					projectEditors: [Meteor.userId()],
					projectDownload: [Meteor.userId()],
					projectPrint: [Meteor.userId()],
					projectView: [Meteor.userId()],
					DFMEAlinks:[],
					PFMEAlinks:[],
					DVPRlinks:[],
					RequirementsLink:[],
					ControlPlanLinks:[],
					PVPRlinks:[],
					MiscDocs:[]
					});
			currProject=newProject;
			Session.set("currentProject",currProject);
			}
		return Projects.findOne(currProject);
	},
	projectDescription: function() {
		if (this)
			if (this.projectDescription)
				return this.projectDescription;
		return "Enter project description"
	},
	revNumber: function() {
		if (this)
			if (this.projectRevision)
			{ retval = this.projectRevision.major+"."+this.projectRevision.minor;
			return retval;
			}
		return "No Rev";
	},
	updateRecentProjects: function() {
		var currProject=Session.get("currentProject");
		//write the push statemt to timestamp it and insert or update.
		if(Accounts.loginServicesConfigured() && currProject)
			{
			var retval, i, foundFlag=false, foundIndex=0, removedVal;
			var projectList=Meteor.user().projectsVisited;
			for (i=0; i<projectList.length; i++)
				{
				if (projectList[i].projectID === currProject){
						foundFlag=true;
						foundIndex=i;
				}}
			if (foundFlag)
			{
				removedVal=projectList.splice(foundIndex,1);
				projectList.unshift(removedVal[0]);
			}
			else
			{
				projectList.unshift({projectID: currProject});
			}
			retval=projectList.slice(0,10);
			Meteor.users.update({_id:Meteor.userId()}, {$set: {projectsVisited: retval}});
	}
}})

var okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};
  var events = {};
  events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
    function (evt) {
      if (evt.type === "keydown" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);

      } else if (evt.type === "keyup" && evt.which === 13 ||
                 evt.type === "focusout") {
        // blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };

  return events;
};
**/
