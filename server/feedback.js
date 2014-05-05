bugs=new Meteor.Collection('bugs');
Meteor.publish('bugs' ,function() {
    return bugs.find();  // narrow this down later
  });

bugs.allow({
  update: function(userId, doc, fields, modifier){
    return true;
  },
  insert: function(userId, doc) {
    return true;
  }
})

var timestamp = (new Date()).getTime();

var bugDoc = {
	reporter: "",
	shortDescription: "",
	longDescription:"",
	reportedDate: timestamp,
	bugType:"",
	bugStatus: ""
	}

