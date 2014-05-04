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
});
	