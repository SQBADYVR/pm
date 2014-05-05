Router.map(function() {
	this.route('home', {
		path: '/',
		template: 'main',
		layoutTemplate: 'layout'
		});
	this.route('termsofuse',{
		path: '/termsofuse',
		template: 'termsofuse',
		layoutTemplate:  'layout'
	});
	this.route('feedback',{
		path: '/feedback',
		template: 'feedback',
		layoutTemplate:  'layout',
	   	onBeforeAction: function() {
    		if(!(Meteor.userId()))
    			Router.go('home');
    	}
	});
	this.route('manageProjects',
	{
		path: '/manageProjects',
		template: 'manageProject',
		layoutTemplate: 'layout',
    	onBeforeAction: function() {
    		if(!(Meteor.userId()))
    			Router.go('home');
    	}
	});
		this.route('manageAccount',
	{
		path: '/manageAccount',
		template: 'manageAccount',
		layoutTemplate: 'layout',
    	onBeforeAction: function() {
    		if(!(Meteor.userId()))
    			Router.go('home');
    	}
	});
	this.route('DFMEA', {
		path: '/DFMEA/:_id',
		layoutTemplate: 'layout',
		template: 'dfmea',
		onBeforeAction: function() {
			if(!(Meteor.user()))
				{Router.go('home');}
			else
 			{
 			Session.set("moduleName","cDFMEA");
 			Session.set("currentDFMEA",this.params._id);
 			}
 		}
	})
});
	