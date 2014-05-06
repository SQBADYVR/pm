Projects=new Meteor.Collection('projects');

/*************************************************
      SlidePanel JS v2.0
      @author Fabio Mangolini
      http://www.responsivewebmobile.com
**************************************************/
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

var projectSubscription=Meteor.subscribe('myProjects');
var myTeam=Meteor.subscribe('colleagues');

var dfmeaSubscription=Meteor.subscribe('dfmeas');
		
// ID of currently selected list
Session.setDefault('currentProject', null);
Session.setDefault('editingProject', null);

var toggleAdmin=function(myRecord) {
	if (Accounts.loginServicesConfigured())
		if (myRecord)  // if passed a good record and the user database is up to date
		{
		myRecord=String(myRecord);
		var currentProject=Session.get("currentProject");
		if (Meteor.userId() && currentProject)
			{
			var currProject=Projects.findOne(currentProject);
			if (currProject)
				{
				if (currProject.projectAdministrators.indexOf(Meteor.userId()) > -1)  //check that user had admin access
					if (currProject.projectAdministrators.indexOf(myRecord) === -1)  // if the record is currently not an admin
						Projects.update({_id:currentProject},{$push:{projectAdministrators: myRecord}});
					else 
					{
					if (currProject.projectAdministrators.length>1)  // cannot deactivate only remaining admin
							{
							if (myRecord === Meteor.userId())  // if I am deactivating my own admin access, confirm it
								$('#checkAdminDelete').modal();
							else Projects.update({_id:currentProject},{$pull:{projectAdministrators: myRecord}});
							}
					else $('#needOneAdmin').modal();
					}
				}			
			}
		}
}

var toggleEditor=function(myRecord) {
	if (Accounts.loginServicesConfigured())
		if (myRecord)  // if passed a good record and the user database is up to date
		{
		myRecord=String(myRecord);
		var currentProject=Session.get("currentProject");
		if (Meteor.userId() && currentProject)
			{
			var currProject=Projects.findOne(currentProject);
			if (currProject)
				{
				if (currProject.projectAdministrators.indexOf(Meteor.userId()) > -1)  //check that user had admin access
					if (currProject.projectEditors.indexOf(myRecord) === -1)  // if the record is currently not an editor
						Projects.update({_id:currentProject},{$push:{projectEditors: myRecord}});
					else Projects.update({_id:currentProject},{$pull:{projectEditors: myRecord}});
				}			
			}
		}
}

var toggleDownload=function(myRecord) {
	if (Accounts.loginServicesConfigured())
		if (myRecord)  // if passed a good record and the user database is up to date
		{
		myRecord=String(myRecord);
		var currentProject=Session.get("currentProject");
		if (Meteor.userId() && currentProject)
			{
			var currProject=Projects.findOne(currentProject);
			if (currProject)
				{
				if (currProject.projectAdministrators.indexOf(Meteor.userId()) > -1)  //check that user had admin access
					if (currProject.projectDownload.indexOf(myRecord) === -1)  // if the record is currently not an editor
						Projects.update({_id:currentProject},{$push:{projectDownload: myRecord}});
					else Projects.update({_id:currentProject},{$pull:{projectDownload: myRecord}});
				}			
			}
		}
}

var togglePrint=function(myRecord) {
	if (Accounts.loginServicesConfigured())
		if (myRecord)  // if passed a good record and the user database is up to date
		{
		myRecord=String(myRecord);
		var currentProject=Session.get("currentProject");
		if (Meteor.userId() && currentProject)
			{
			var currProject=Projects.findOne(currentProject);
			if (currProject)
				{
				if (currProject.projectAdministrators.indexOf(Meteor.userId()) > -1)  //check that user had admin access
					if (currProject.projectPrint.indexOf(myRecord) === -1)  // if the record is currently not an editor
						Projects.update({_id:currentProject},{$push:{projectPrint: myRecord}});
					else Projects.update({_id:currentProject},{$pull:{projectPrint: myRecord}});
				}			
			}
		}
}

var toggleView=function(myRecord) {
	if (Accounts.loginServicesConfigured())
		if (myRecord)  // if passed a good record and the user database is up to date
		{
		myRecord=String(myRecord);
		var currentProject=Session.get("currentProject");
		if (Meteor.userId() && currentProject)
			{
			var currProject=Projects.findOne(currentProject);
			if (currProject)
				if (!(currProject.publicProject))
				{
				if (currProject.projectAdministrators.indexOf(Meteor.userId()) > -1)  //check that user had admin access
					if (currProject.projectView.indexOf(myRecord) === -1)  // if the record is currently not an editor
						Projects.update({_id:currentProject},{$push:{projectView: myRecord}});
					else if (!(currProject.publicProject))
						Projects.update({_id:currentProject},{$pull:{projectView: myRecord}});
				}			
			}
		}
}

var defaultUserPublic=function() {
	if (Accounts.loginServicesConfigured())
		if (Meteor.userId())
			if (Meteor.userId().paidSubscriber)
				return false;
	return true;
}

Template.manageProject.helpers ({
	enterManageProjects: function() {
		Session.set("moduleName","Project Manager");
		return null;
	},
	anyProjects: function() {
		if (Projects.find({projectMembers: Meteor.userId()})) 
			if (Projects.find({projectMembers: Meteor.userId()}).count()>0)
			{
				return true;
			}
		return false;
	},
	projectsICanSee: function() {
		return Projects.find({projectMembers: Meteor.userId()});
	},
	projectSelected: function() {
		return (Session.get("currentProject"));
	},
	editing: function() {
		return Session.equals('editingProject', this._id);
	},
	selectedProject: function() {
		return Session.equals("currentProject", this._id) ? "selectedProject" : "";
	},
	projectMembers: function() {
		var currProject=Session.get("currentProject");
		if (currProject)
			return Projects.findOne({_id: Session.get("currentProject")}).projectMembers;
		else return null;
	},
	projectMember: function() {
		return this;
	},
	isMe: function() {
		if (String(this) == Meteor.userId())
			return true;
		else return false;
	},
	adminsProject: function() {
		if (Session.get("currentProject")) {
			var currProj=Projects.findOne({_id:Session.get("currentProject")});
			if (currProj)
				return (currProj.projectAdministrators.indexOf(Meteor.userId()) >-1);
		}
		return false;
	},
	titleItem: function() {
		
    headerNode=DFMEAs.findOne({_id: Session.get("currentDFMEA")});
    if (headerNode)
      if (headerNode.header)
        return headerNode.header.title;
 	},
 	listOfAdmins: function() {
 		if (Session.get("currentProject")){
 			var currProj=Projects.findOne({_id:Session.get("currentProject")});
 			if (currProj)
 			{
 			var admins=currProj.projectAdministrators;
 			var adminNames=Meteor.users.find({_id: {$in: admins}});
 			if (adminNames)
 				return adminNames;
 			}
	}
 	},
 	getAddress: function() {
 		if ((this) && (this.emails) && (this.emails[0]))
 			return this.emails[0].address;
 		else return null;
 	},
	listOfDocuments: function() {
		var retval=[];
		var currProject=Session.get("currentProject");
		var tempKey=[],
			tempKey2=[],
			i;
		if(currProject) {
			var currProjectObject=Projects.findOne({_id: currProject});
			for (i=0; i<currProjectObject.DFMEAlinks.length;i++)
				tempKey.push("Design FMEA");
			retval=_.zip(tempKey,(currProjectObject.DFMEAlinks));
			tempKey=[];
			for (i=0; i<currProjectObject.PFMEAlinks.length;i++)
				tempKey.push("Process FMEA");
			tempKey2=_.zip(tempKey,currProjectObject.PFMEAlinks)
			retval=retval.concat(tempKey2);
			tempKey=[];
			tempKey2=[];
			for (i=0; i<currProjectObject.DVPRlinks.length;i++)
				tempKey.push("DVP&R");
			tempKey2=_.zip(tempKey2,(currProjectObject.DVPRlinks));
			retval=retval.concat(tempKey2);
			tempKey=[];
			tempKey2=[];
			for (i=0; i<currProjectObject.RequirementsLink.length;i++)
				tempKey.push("Requirements");
			tempKey2=_.zip(tempKey,currProjectObject.RequirementsLink);
			retval=retval.concat(tempKey2);
			tempKey=[];
			tempKey2=[];
			for (i=0; i<currProjectObject.ControlPlanLinks.length;i++)
				tempKey.push("Control Plans");
			tempKey2=_.zip(tempKey2,(currProjectObject.ControlPlanLinks));
			retval=retval.concat(tempKey2);
			tempKey=[];
			tempKey2=[];
			for (i=0; i<currProjectObject.PVPRlinks.length;i++)
				tempKey.push("PVR&P");
			tempKey2=_.zip(tempKey,currProjectObject.PVPRlinks);
			retval=retval.concat(tempKey2);
			tempKey=[];
			tempKey2=[];
			for (i=0; i<currProjectObject.MiscDocs.length;i++)
				tempKey.push("Document");
			tempKey2=_.zip(tempKey,currProjectObject.MiscDocs);
			retval=retval.concat(tempKey2);
			}
		return retval;
	},
	docLink: function(){
		var retval;
		if (this) {
			switch (this[0]) {
				case "Design FMEA": {
					retval="/DFMEA/"+this[1];
					return retval;
					break;
				};
				case "Process FMEA": {
					retval="/PFMEA/"+this[1];
					return retval;
					break;
				}
				default:  return null;
			}
		}
	},	
	docType: function()
	{
		if (this)
			return this[0];
	},
	docName: function(){
		var retval;
		if (this) {
			switch (this[0]) {
				case "Design FMEA": {
					if (this[1])
						retval=DFMEAs.findOne({_id: this[1]},{header: 1});
						if ((retval) && (retval.header))
							return retval.header.title;
					break;
				};
				case "Process FMEA": {
					if (this[1])
						retval=PFMEAs.findOne({_id: this[1]},{header: 1});
						if ((retval) && (retval.header))
							return retval.header.title;
					break;
				};
				default:  return null;
			}
		}
	},
	isPublic: function() {
		if (Session.get("currentProject"))
		{
			var currProject=Projects.findOne({_id: Session.get("currentProject")})
			if ((currProject) && (currProject.publicProject))
			return "checked";
		}
		return "";
	},
	isNotPublic: function() {
		if (Session.get("currentProject"))
		{
			var currProject=Projects.findOne({_id: Session.get("currentProject")})
			if ((currProject) && (!(currProject.publicProject)))
			return "checked";
		}
		return "";
	},
	isNotPublic2: function() {
		return (!(this.publicProject));
	},
	debug: function() {
		return true;
	},
	email: function () {
		var temp=this;
		var userDude=Meteor.users.findOne(String(temp));

		if (userDude)
		{
			if (userDude.username)
			{
				return userDude.username;
			}
			else if (userDude.emails)
				if (userDude.emails.length>0)
				{
				return userDude.emails[0].address;
				}
		}
		return "Hidden User";
	},
	isAdmin: function() {
		var self=this;
		var currProject=Session.get("currentProject");
		if (!(currProject))
		{
			return "btn-default";
		}
		else
		{
			var currProjectObject=Projects.findOne(currProject);
			if (currProjectObject.projectAdministrators.indexOf(String(self)) === -1) // is not an administrator
				return "btn-default";
			else
				return "btn-success";
		}
	},	
	canEdit: function() {
		var self=this;
		var currProject=Session.get("currentProject");
		if (!(currProject))
		{
			return "btn-default";
		}
		else
		{
			var currProjectObject=Projects.findOne(currProject);
			if (currProjectObject.projectEditors.indexOf(String(self)) === -1) 
				return "btn-default";
			else
				return "btn-success";
		}
	},	
	canDownload: function() {
		var self=this;
		var currProject=Session.get("currentProject");
		if (!(currProject))
		{
			return "btn-default";
		}
		else 
		{
			var currProjectObject=Projects.findOne(currProject);
			if (currProjectObject.publicProject){
				if (currProjectObject.projectDownload.indexOf(String(self)) === -1) 
					Projects.update({_id:currProject},{$push:{projectDownload: String(self)}});
				return "btn-success disabled";
			}
			else {
				if (currProjectObject.projectDownload.indexOf(String(self)) === -1) 
					return "btn-default";
				else
					return "btn-success";
			}
		}
	},
	canPrint: function() {
		var self=this;
		var currProject=Session.get("currentProject");
		if (!(currProject))
		{
			return "btn-default";
		}
		else
		{
			var currProjectObject=Projects.findOne(currProject);
			if (currProjectObject.publicProject){
				if (currProjectObject.projectPrint.indexOf(String(self)) === -1) 
					Projects.update({_id:currProject},{$push:{projectPrint: String(self)}});
				return "btn-success disabled";
			}
			else {
				if (currProjectObject.projectPrint.indexOf(String(self)) === -1) 
					return "btn-default";
				else
					return "btn-success";
			}
		}
	},
	canView: function() {
		var self=this;
		var currProject=Session.get("currentProject");
		if (!(currProject))
		{
			return "btn-default";
		}
		else
		{
			var currProjectObject=Projects.findOne(currProject);
			if (currProjectObject.publicProject){
				if (currProjectObject.projectView.indexOf(String(self)) === -1) 
					Projects.update({_id:currProject},{$push:{projectView: String(self)}});
				return "btn-success disabled";
			}
			else {
				if (currProjectObject.projectView.indexOf(String(self)) === -1) 
					return "btn-default";
				else
					return "btn-success";
			}
		}
	},
	isProjectLoaded: function () {
		return (projectSubscription.ready());
	},	
	colleague: function() {
		if (Accounts.loginServicesConfigured() && Session.get("currentProject")) {
			var myID=Meteor.userId();
			if (myID) {
				var colleagues=Meteor.user().colleagues;	//update to remove those already in the project!
				var retval=_.difference(colleagues, Projects.findOne(Session.get('currentProject')).projectMembers);
				return retval;
			}
		} else return null;
	},
	nameOrEmail: function () {
		if (myTeam.ready()) {
			var self=this;
			if (self) { 
			var colleague=Meteor.users.findOne({_id:String(self)});
			if (colleague.username)
				return colleague.username;
			else if (colleague.emails.length>0)
				return colleague.emails[0].address;
			}}
		return null;
	},
	createNewProject: function() {
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
		if (Session.get("currentProject"))
		{
		var currProject=Projects.findOne({_id: Session.get("currentProject")});
		if ((currProject) && (currProject.projectDescription))
			return currProject.projectDescription;
		}
		return "Enter project description"
	},
	getProjectName: function() {
		if (Session.get("currentProject"))
		{
		var currProject=Projects.findOne({_id: Session.get("currentProject")});
		if ((currProject) && (currProject.projectName))
			return currProject.projectName;
		}
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

var activateInput = function (input) {
  input.focus();
  input.select();
};

Template.manageProject.events(okCancelEvents(
  '#createNewProject',
  {
    ok: function (text, evt) {	
      if ((text) && Accounts.loginServicesConfigured())  // may need to harden security on name of project
      {
      	var newProject=Projects.insert(
					{
					projectName: text,
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
		Session.set('currentProject',newProject);
      }
      evt.target.value='';
  },
    cancel: function () {
  	 }
     }));

Template.manageProject.events(okCancelEvents(
  '#editProjectName', 
  {
    ok: function (text, evt) {	
      if ((text) && Accounts.loginServicesConfigured())
      {
      	Projects.update({_id: Session.get('currentProject')},{$set: {projectName: text}});
      }
      evt.target.value='';
      Session.set('editingProject',null);
  },
    cancel: function () {
  	 Session.set('editingProject',null);}
     }));
Template.manageProject.events(okCancelEvents(
  '#editingProjectName', 
  {
    ok: function (text, evt) {	
      if ((text) && Accounts.loginServicesConfigured())
      {
      	Projects.update({_id: Session.get('currentProject')},{$set: {projectName: text}});
      }
      evt.target.value='';
      Session.set('editingProject',null);
  },
    cancel: function () {
  	 Session.set('editingProject',null);}
     }));
Template.manageProject.events(okCancelEvents(
  '#projectDescription',
  {
    ok: function (text, evt) {	
      if ((text) && Accounts.loginServicesConfigured())
      {
      	Projects.update({_id: Session.get('currentProject')},{$set: {projectDescription: text}});
      }
      evt.target.value='';
  },
    cancel: function () {
  	 }
     }));

Template.manageProject.events ({
  'dblclick .projectNames': function (evt, tmpl) { 
    Session.set('editingProject', this._id);
    Session.set('currentProject', this._id);
    Deps.flush(); // force DOM redraw, so we can focus the edit field
    activateInput(tmpl.find("#editProjectName"));
  },
  'click .projectNames': function(evt) {
  	Session.set('currentProject',this._id);
  },
  'click .destroyUser': function (evt) {
  	if (this)
  	{
  	var userToDelete=String(this);
	Projects.update({_id:Session.get("currentProject")},{$pull:{projectAdministrators: userToDelete, projectEditors: userToDelete, projectDownload: userToDelete,projectPrint: userToDelete,projectView: userToDelete, projectMembers: userToDelete}});
	}
	else return null;
  },
  'click .createDFMEA': function(evt) {
  	evt.stopPropagation();
	if (Session.get("currentProject"))
	{
		var timestamp = (new Date()).getTime();
		var FMEA_root= {
			header : {
			number : "1",
			team : [Meteor.userId()],
			title : "New DFMEA",
			creation_date : timestamp,
			revision_date : timestamp,
			},
		content: "Blank DFMEA form",
		nodeKind : "FMEAroot",
		parentcategory : null,
		parentProject: [Session.get("currentProject")],
		subcategories : [],
		undoStack: [],
		archivedStack:[],
		revision: {major: 0, minor: 1}
		}

		var FMEA_id = DFMEAs.insert(FMEA_root);
		Projects.update({_id: Session.get("currentProject")},{$push: {DFMEAlinks: FMEA_id}});

		var  fctn_id = DFMEAs.insert({
			nodeKind: "designFunction",
			nodeText: "Design Function",
			parentCategory: FMEA_id,
			subcategories: [],
			content: "New Design Function",
			parentProject: [Session.get("currentProject")],
			rootID: FMEA_id,
			rowSpan:1,
			sortOrder: Math.random()*100000000
			});
		DFMEAs.update({_id: FMEA_id}, {$push: {subcategories: fctn_id}});
		var fmode_id = DFMEAs.insert({
			nodeKind: "failureMode",
			nodeText: "Failure Mode",
			parentCategory: fctn_id,
			subcategories: [],
			content: "New Failure Mode",
			parentProject:[Session.get("currentProject")],
			rootID: FMEA_id,
			rowSpan:1,
			sortOrder: Math.random()*100000000
			});
		DFMEAs.update({_id: fctn_id}, {$push: {subcategories: fmode_id}});
		var effects_id = DFMEAs.insert({
			nodeKind: "failureEffects",
			nodeText: "Effect of Failure",
			parentCategory: fmode_id,
			subcategories: [],
			content: "New Failure Effects",
			SEV: 10,
			classification: " ",
			parentProject:[Session.get("currentProject")],
			rootID: FMEA_id,
			rowSpan:1,
			sortOrder: Math.random()*100000000
			});
		DFMEAs.update({_id: fmode_id}, {$push: {subcategories: effects_id}});
		var cause_id = DFMEAs.insert({
			nodeKind: "failureCauses",
			nodeText: "Potential Cause",
			parentCategory: effects_id,
			subcategories: [],
			content: "Potential Cause of Failure",
			OCC: 10,
			designControl: "Design Controls to Detect Failure",
			DET: 10,
			parentProject:[Session.get("currentProject")],
			rootID: FMEA_id,
			rowSpan:1,
			sortOrder: Math.random()*100000000
			});
		DFMEAs.update({	_id: effects_id}, {$push: {subcategories: cause_id}});
		return FMEA_id;
	}
	else return null;
  },
  'click .createPFMEA': function(evt) {
  	evt.stopPropagation();
	if (Session.get("currentProject"))
	{
		var timestamp = (new Date()).getTime();
		var FMEA_root= {
			header : {
			number : "1",
			team : [Meteor.userId()],
			title : "New PFMEA",
			creation_date : timestamp,
			revision_date : timestamp,
			},
		content: "Blank PFMEA form",
		nodeKind : "PMEAroot",
		parentcategory : null,
		parentProject: [Session.get("currentProject")],
		subcategories : [],
		undoStack: [],
		archivedStack:[],
		revision: {major: 0, minor: 1}
		}

		var FMEA_id = PFMEAs.insert(FMEA_root);
		Projects.update({_id: Session.get("currentProject")},{$push: {PFMEAlinks: FMEA_id}});

		var  fctn_id = PFMEAs.insert({
			nodeKind: "processFunction",
			nodeText: "Process Function",
			parentCategory: FMEA_id,
			subcategories: [],
			content: "New Process Function",
			parentProject: [Session.get("currentProject")],
			rootID: FMEA_id,
			rowSpan:1,
			sortOrder: Math.random()*100000000
			});
		PFMEAs.update({_id: FMEA_id}, {$push: {subcategories: fctn_id}});
		var fmode_id = PFMEAs.insert({
			nodeKind: "failureMode",
			nodeText: "Failure Mode",
			parentCategory: fctn_id,
			subcategories: [],
			content: "New Failure Mode",
			parentProject:[Session.get("currentProject")],
			rootID: FMEA_id,
			rowSpan:1,
			sortOrder: Math.random()*100000000
			});
		PFMEAs.update({_id: fctn_id}, {$push: {subcategories: fmode_id}});
		var effects_id = PFMEAs.insert({
			nodeKind: "failureEffects",
			nodeText: "Effect of Failure",
			parentCategory: fmode_id,
			subcategories: [],
			content: "New Failure Effects",
			SEV: 10,
			classification: " ",
			parentProject:[Session.get("currentProject")],
			rootID: FMEA_id,
			rowSpan:1,
			sortOrder: Math.random()*100000000
			});
		PFMEAs.update({_id: fmode_id}, {$push: {subcategories: effects_id}});
		var cause_id = PFMEAs.insert({
			nodeKind: "failureCauses",
			nodeText: "Potential Cause",
			parentCategory: effects_id,
			subcategories: [],
			content: "Potential Cause of Failure",
			OCC: 10,
			processControlPrevention: "Process Controls to Prevent Failure",
			processControlDetection: "Process Controls to Detect Failure",
			DET: 10,
			parentProject:[Session.get("currentProject")],
			rootID: FMEA_id,
			rowSpan:1,
			sortOrder: Math.random()*100000000
			});
		PFMEAs.update({	_id: effects_id}, {$push: {subcategories: cause_id}});
		return FMEA_id;
	}
	else return null;
  },
  'click .Admin': function() {
  	return toggleAdmin(this);
  },

  'click .Editor': function() {
  	return toggleEditor(this);
  }, 

  'click .Download': function() {
  	return toggleDownload(this);
  },

  'click .Print': function() {
  	return togglePrint(this);
  },
 'click .Viewer': function() {
  	return toggleView(this);
  },
  'click #confirmDelete': function() {
  		Projects.update({_id:Session.get("currentProject")},{$pull:{projectAdministrators: Meteor.userId()}});
  },
  'click .btn-add-to-project': function() {
  		if (this)
  		{
  			var self=String(this);
  			if (self === "")	
  				return;
  			else Projects.update({_id:Session.get("currentProject")},{$push:{projectMembers: self}});
  		}
  },
  'click #helpButton': function() {
  	$('#helpOnProjects').modal();
  },
  'click .btn-help': function() {
  	if (this)
  	{
  		$('#helpOnProjects').modal();
  	}
  },
  'click .projectType': function() {
	var projType=$("input[name='optionsRadios']:checked",$('#projectType')).val();
	var projBool=(projType === "private") ? false : true;
    Projects.update({_id:Session.get("currentProject")},{$set: {publicProject: projBool}});
  },
  'click .btn-rev-minor': function() {
  	;
  },
  'click .btn-rev-major': function() {
  	;
  }
})

