RAIL = new Meteor.Collection('rail');

Meteor.publish('rail',function() {
    return RAIL.find();  // narrow this down later
});

RAIL.allow({
  update: function(userId, doc, fields, modifier){
    return true;
  },
  insert: function(userId, doc) {
    return true;
  }
})