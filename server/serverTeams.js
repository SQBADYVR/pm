Meteor.publish('teammates', function () {
	if (this.userId)
		{console.log(this.userId);
			return Meteor.users.find({_id: this.userId},
				{fields: {invited: 1, colleagues:1, blacklist:1, includeDomain: 1}})}
	else
		this.ready();
});

Meteor.users.allow({
	update: function(userId, doc, fields, modifier) {
		if (userId && userId===doc._id)  // user logged in and user owns the document he/she is modifying
			if (fields && (fields.indexOf("invitedUsers")===0 || (field.indexOf("colleagues")===0)))
				if (modifier && (modifier._contains("$each") || modifier._contains("$pull")))
					return true;
		return false;

}});