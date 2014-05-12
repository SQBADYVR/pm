RAIL=new Meteor.Collection('rail');
var railSubscription=Meteor.subscribe('rail');

newAIObject={
	actionItem: "",
	details:  "",
	dueDate: new Date(),
	actualDate: "",
	responsibility: "",
	projectLink: [],
	referenceLink: [],
	timestamp: new Date(),
	sortOrder: 1
}

Template.RAILfmea.helpers ({
  enterRAILModal: function () {
  	newAIObject.projectLink=_.union(newAIObject.projectLink,[Session.get("currentProject")]);
  	var linkToPush={
  		referenceType: "DFMEA",
  		link: ""
  	};
  	newAIObject.referenceLink=_.union(newAIObject.referenceLink,[linkToPush]);
  },
  editingAI: function() {
		return true;
	},
  editingDetails: function() {
	return true;
	},
  editingDueDate: function() {
		return true;
	},
  editingActualDate: function() {
		return true;
	},
  editingResponsibility: function() {
		return true;
	}
});

var activateInput = function (input) {
  input.focus();
  input.select();
};

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

Template.RAILfmea.events ({
  'click .AIEdit': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Session.set('editField',"Scope");
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#AIInput"));
  },
    'click .detailsEdit': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Session.set('editField',"details");
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#detailsInput"));
  },
    'click .dueDateEdit': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Session.set('editField',"dueDate");
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#dueDateInput"));
  },
    'click .actualDateEdit': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Session.set('editField',"actualDate");
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#actualDateInput"));
  },  'click .responsibilityEdit': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Session.set('editField',"Responsiblity");
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#responsibilityInput"));
  }
});

Template.RAILfmea.events(okCancelEvents(
  '#AIInput',
  {
    ok: function (text, evt) {
 	  newAIObject.actionItem=text;
      Session.set("editing_itemname", null);
      Session.set('editField',null);
    },
  cancel: function () {
      Session.set('editing_itemname', null);
      Session.set('editField',null);
    }})
);


Template.RAILfmea.events(okCancelEvents(
  '#detailsInput',
  {
    ok: function (text, evt) {
 	  newAIObject.details=text;
      Session.set("editing_itemname", null);
      Session.set('editField',null);
    },
  cancel: function () {
      Session.set('editing_itemname', null);
      Session.set('editField',null);
    }})
);

Template.rails.rendered=function() {
    $('#datepickerDue').datepicker();
}

Template.rails.rendered=function() {
    $('#datetimepicker5').datepicker();
}