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
});
	