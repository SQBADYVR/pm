var myTeam=Meteor.subscribe('colleagues');
var myInvites=Meteor.subscribe('invited');
var mySelf=Meteor.subscribe('self');

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

var toggleAutoAccept=function() {
	if (Accounts.loginServicesConfigured()) {
		var myID=Meteor.userId();
		if (myID)
			if (Meteor.user().includeDomain)
				Meteor.users.update({_id: myID}, {$set: {includeDomain: false}})  // not working
			else Meteor.users.update({_id: myID},{$set: {includeDomain: true}});
		
		}
	return null;
}

var matchMyDomain=function(doc, index, cursor) {
	if (doc.emails.length > 0)
	{
		var theirEmail= doc.emails[0].address;
  	 	var theirDomain=theirEmail.substr(theirEmail.indexOf('@')+1);
  	 	var domainName=Meteor.user().emails[0].address;
		var myDomain=domainName.substr(domainName.indexOf('@')+1);
		if (myDomain == theirDomain)
		{
			var me=Meteor.user();
			Meteor.users.update({_id: doc._id}, {$addToSet: {colleagues: Meteor.userId()}});
			Meteor.users.update({_id: doc._id}, {$pull: {invitations: String(me.username)}});
			if (me.emails.length>0)
			Meteor.users.update({_id: doc._id}, {$pull: {invitations: String(me.emails[0].address)}});
			Meteor.users.update({_id: Meteor.userId()}, {$addToSet: {colleagues: doc._id }});

		}
	}
}

var handler=Meteor.setInterval(function() {
	if (Accounts.loginServicesConfigured()) {
		if (Meteor.user())
		if (Meteor.user().includeDomain)  // if autoaccepting same domain name invites
		{	var me=Meteor.user();
			var invitedMe=Meteor.users.find({invitations: {$in: [me.username, me.emails[0].address]}}).fetch();  // fix for username or email
			invitedMe.forEach(matchMyDomain);
	}
}},5000);

var removeColleague=function(oldColleague) {
	var me=Meteor.user();
	if (oldColleague && me && me.colleagues)
	{
		Meteor.users.update({_id: String(oldColleague)}, {$pull: {colleagues: Meteor.userId()}});
		Meteor.users.update({_id: Meteor.userId()}, {$pull: {colleagues: String(oldColleague)}});
	}
	return;
};

var removeInvitation=function(oldInvitee) {
	var me=Meteor.user();
	if (oldInvitee && me && me.invitations)
	{
		Meteor.users.update({_id: Meteor.userId()}, {$pull: {invitations: String(oldInvitee)}});
	}
	return;
};

var acceptInvite=function(invitor) {
	var me=Meteor.user();
	if (invitor && me)
	{
		Meteor.users.update({_id: invitor._id}, {$addToSet: {colleagues: Meteor.userId()}});
		Meteor.users.update({_id: invitor._id}, {$pull: {invitations: String(me.username)}});
		if (me.emails.length>0)
			Meteor.users.update({_id: invitor._id}, {$pull: {invitations: String(me.emails[0].address)}});
		Meteor.users.update({_id: Meteor.userId()}, {$addToSet: {colleagues: invitor._id}});
	}
	return;
};

var rejectInvite=function(invitor) {
	var me=Meteor.user();
	if (invitor && me)
	{
		console.log ("ready to reject");
		Meteor.users.update({_id: invitor._id}, {$pull: {invitations: String(me.username)}});
		if (me.emails.length>0)
			Meteor.users.update({_id: invitor._id}, {$pull: {invitations: String(me.emails[0].address)}});
	}
	return;
};

Template.manageAccount.helpers ({
	name: function() {
		if (Accounts.loginServicesConfigured()) {
			var myID=Meteor.userId();
			if (myID)
		  		if (Meteor.user().username)
					return Meteor.user().username;
				else if(Meteor.user().emails.length>0)
					return Meteor.user().emails[0].address;
		}
		return null;
	},
	firstName: function() {
		if (Accounts.loginServicesConfigured()) {
			var myID=Meteor.userId();
			if (myID)
		  		if (Meteor.user().firstName)
					return Meteor.user().firstName;
				else return " ";
		}
		return null;
	},
	lastName: function() {
		if (Accounts.loginServicesConfigured()) {
			var myID=Meteor.userId();
			if (myID)
		  		if (Meteor.user().lastName)
					return Meteor.user().lastName;
				else return " ";

		}
		return null;
	},
	email: function() {
		if (Accounts.loginServicesConfigured()) {
			var myID=Meteor.userId();
			if (myID)
		 		 if (Meteor.user().emails.length>0)
			 	 return Meteor.user().emails[0].address;
			}
		return null;
	},
	autoAcceptInvite: function() {
		if (Accounts.loginServicesConfigured()) {
			var myID=Meteor.userId();
			if (myID){
		 		 if (Meteor.user().includeDomain)
			 	 return "checked";
			 }
		}
		return "";
	},
	colleague: function() {
		if (Accounts.loginServicesConfigured()) {
			var myID=Meteor.userId();
			if (myID) {
				return Meteor.user().colleagues;
			}
		} else return null;
	},
	invitedUser: function () {
		if (Accounts.loginServicesConfigured()) {
			var myID=Meteor.users.findOne(Meteor.userId());
			if (myID) {
				var retval= Meteor.users.find({invitations: {$in: [String(myID.username), String(myID.emails[0].address)]}}).fetch();  //fix to reflect username or email rather than ID
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
	invitedMeNameOrEmail: function() {
		var self=this;
		if (self) {
			if (self.username)
				return self.username;
			else if (self.emails.length>0)
				return self.emails[0].address;
		}
		return null;
	},
	usersIveInvited: function() {
		if (Accounts.loginServicesConfigured()) {
			var myID=Meteor.userId();
			if (myID) {
				var retval= Meteor.user().invitations;
				return retval;
			}
		} 
		return null;
	},
	listInvited: function() {
		return this;
	},
	editFirstName: function() {
		return (Session.get("editingFirstName"));
	},
	editLastName: function() {
		return (Session.get("editingLastName"));
	},

	myDomainName: function() {
		if (Accounts.loginServicesConfigured()) {
			var myID=Meteor.userId();
			if (myID)
		 		 if (Meteor.user().emails.length>0) {
			 	 var domainName=Meteor.user().emails[0].address;
			 	 var retval=domainName.substr(domainName.indexOf('@')+1);
			 	 return retval;
			}
		}
		return null;
	}
});

var activateInput = function (input) {
  input.focus();
  input.select();
};

Template.manageAccount.events ({
 'click #autoAcceptInvite': function () {
    toggleAutoAccept();
    //  add in function to clear invitees to colleagues if domain names match.
  },

  'click .btn-remove-colleague' : function () {
  	removeColleague(this);
  },

  'click .btn-rescind-invitation': function () {
  	removeInvitation(this);
  },

  'click .btn-accept-invite': function () {
  	acceptInvite(this);
  },

  'click .btn-reject-invite': function () {
  	rejectInvite(this);
  },
  'dblclick .last-name-edit': function(evt,tmpl) {
  	Session.set("editingLastName",true);
    Deps.flush(); // force DOM redraw, so we can focus the edit field
    activateInput(tmpl.find("#editLastName"));
  },
  'dblclick .first-name-edit': function(evt,tmpl) {
  	Session.set("editingFirstName",true);
    Deps.flush(); // force DOM redraw, so we can focus the edit field
    activateInput(tmpl.find("#editFirstName"));
  }

});

Template.manageAccount.events(okCancelEvents(
  '#newInvitation',
  {
    ok: function (text, evt) {	
      if ((text) && Accounts.loginServicesConfigured())
      {
      	
      	Meteor.users.update({_id: Meteor.userId()},{$addToSet: {invitations: text}});
      	// need to write function to generate email for non-registered user.
      	// calling server method inviteNewUser(text) to check for existence of the user and invitation if they 
      	// don't exist.
      	Meteor.call('inviteNewUser', Meteor.userId(), text);
      }
      evt.target.value='';
    },
    cancel: function () {
      ;
    }
  }));

Template.manageAccount.events(okCancelEvents(
  '#editFirstName',
  {
    ok: function (text, evt) {	
      if ((text) && Accounts.loginServicesConfigured())
      {
      	Meteor.users.update({_id: Meteor.userId()},{$set: {firstName: text}});
      	// need to write function to generate email for non-registered user.
      	// calling server method inviteNewUser(text) to check for existence of the user and invitation if they 
      	// don't exist.
      }
      evt.target.value='';
     Session.set("editingFirstName",null);},
    cancel: function () {
     Session.set("editingFirstName",null);  ;
 	 }
     }));

Template.manageAccount.events(okCancelEvents(
  '#editLastName',
  {
    ok: function (text, evt) {	
      if ((text) && Accounts.loginServicesConfigured())
      {
      	Meteor.users.update({_id: Meteor.userId()},{$set: {lastName: text}});
      	// need to write function to generate email for non-registered user.
      	// calling server method inviteNewUser(text) to check for existence of the user and invitation if they 
      	// don't exist.
      }
      evt.target.value='';
     Session.set("editingLastName",null);},
    cancel: function () {
      Session.set("editingLastName",null);
  }
    }));