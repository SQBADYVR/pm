bugs=new Meteor.Collection('bugs');
Meteor.subscribe('bugs');
Meteor.subscribe('colleagues');

Template.feedback.helpers({
	existingBugs: function() {
	if (Accounts.loginServicesConfigured())
	{
		var bugList=bugs.find({bugType:"bug"},{sort: {status: -1, timestamp: 1}});
		return bugList;
	}},
	featureRequests: function() {
	if (Accounts.loginServicesConfigured())
	{
		var bugList=bugs.find({bugType:"features"},{sort: {status: -1, timestamp: 1}});
		return bugList;
	}},
	generalRequests: function() {
	if (Accounts.loginServicesConfigured())
	{
		var bugList=bugs.find({bugType:"general"},{sort: {status: -1, timestamp: 1}});
		return bugList;
	}},
	shortDescription: function() {
		if (this)
			if(this.shortDescription)
				return this.shortDescription;
	},
	detailedDescription: function() {
		if (this)
			if (this.longDescription)
				return (this.longDescription);
	},
	bugDate: function() {
		if (this)
			if (this.reportedDate)
			{
				var d= new Date(this.reportedDate);
				var retval=String(d.getMonth()+1)
				retval+="/"+d.getDate()+"/"+d.getFullYear();
				return retval;
			}
	},
	status: function() {
		return this.bugStatus;
	},
	bugUserName: function() {
		if(this)		
			if (this.reporter)
				if (Accounts.loginServicesConfigured())
				{
					var userRecord=Meteor.users.findOne({_id:this.reporter});
					if (!(userRecord))
						return this.reporter;
					else return userRecord.username;
				}
	}
});

Template.feedback.events({
	'click #bugSubmit': function() {
		var self=this;
		var bugToLog=new Object;
		var shortDescription=$('#bugDescription').val();
		var longDescription=$('#detailedDescription').val();
				bugToLog={
			reporter: Meteor.userId(),
			reportedDate:(new Date()).getTime(),
			bugType:"bug",
			bugStatus:"open",
			shortDescription: shortDescription,
			longDescription: longDescription
		}
		if (shortDescription)
			bugs.insert(bugToLog);
	},
	'click #featureSubmit': function() {
		var self=this;
		var bugToLog=new Object;
		var shortDescription=$('#featureDescription').val();
		var longDescription=$('#featureDetailedDescription').val();
				bugToLog={
			reporter: Meteor.userId(),
			reportedDate:(new Date()).getTime(),
			bugType:"features",
			bugStatus:"open",
			shortDescription: shortDescription,
			longDescription: longDescription
		}
		if (shortDescription)
			bugs.insert(bugToLog);
	},
	'click #generalSubmit': function() {
		var self=this;
		var bugToLog=new Object;
		var shortDescription=$('#generalDescription').val();
		var longDescription=$('#generalDetailedDescription').val();
				bugToLog={
			reporter: Meteor.userId(),
			reportedDate:(new Date()).getTime(),
			bugType:"general",
			bugStatus:"open",
			shortDescription: shortDescription,
			longDescription: longDescription
		}
		if (shortDescription)
			bugs.insert(bugToLog);
	}
});

