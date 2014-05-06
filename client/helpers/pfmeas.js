// Need to make help lessons
// Need to fix security for write access to matrix
// Need to fix security for write to remote file
// Need to fix revisioining
// Need to build out the choose DFMEA
// Need to build out nested DFMEA
// Need to build out autogenerating FM

PFMEAs=new Meteor.Collection('pfmeas');
var pfmeaSubscription=Meteor.subscribe('pfmeas');
var selfSubscription=Meteor.subscribe('self');
var colleagueSubscription=Meteor.subscribe('colleagues');
var headerNode=null;

var buildNewCause = function(parentNodeID,oldNode,promptText)  {
  		var newNode=new Object;
  		var oldNodeDetail=PFMEAs.findOne({_id:oldNode});
  		jQuery.extend(newNode, oldNodeDetail);
  		newNode.timestamp=(new Date()).getTime();
  		newNode.content=promptText;
  		newNode.rowSpan=1;
  		newNode.subcategories=[];
  		newNode.parentCategory=parentNodeID;
  		newNode.OCC=10;
  		newNode.DET=10;
  		newNode.processControlPrevention="New Process Control";
      newNode.processControlDetection="New Quality Check";
  		delete newNode._id;
  		var newlyCreatedNode=PFMEAs.insert(newNode);
  		PFMEAs.update({_id:parentNodeID},{$push: {subcategories: newlyCreatedNode}});
   		};

var buildNewEffect = function(parentNodeID,oldNode,promptText)  {
  		var newNode=new Object;
  		var oldNodeDetail=PFMEAs.findOne({_id:oldNode});
  		jQuery.extend(newNode, oldNodeDetail);
  		newNode.timestamp=(new Date()).getTime();
  		newNode.content=promptText;
  		newNode.rowSpan=1;
  		newNode.subcategories=[];
  		newNode.parentCategory=parentNodeID;
  		newNode.SEV=10;
  		newNode.Classification="";
  		delete newNode._id;
  		var newlyCreatedNode=PFMEAs.insert(newNode);
  		PFMEAs.update({_id:parentNodeID},{$push: {subcategories: newlyCreatedNode}});
  		buildNewCause(newlyCreatedNode, oldNodeDetail.subcategories[0],"Potential Cause(s)");
  		};

var buildNewFM = function(parentNodeID,oldNode,promptText)  {
  		var newNode=new Object;
  		var oldNodeDetail=PFMEAs.findOne({_id:oldNode});
  		jQuery.extend(newNode, oldNodeDetail);
  		newNode.timestamp=(new Date()).getTime();
  		newNode.content=promptText;
  		newNode.rowSpan=1;
  		newNode.subcategories=[];
  		newNode.parentCategory=parentNodeID;
  		delete newNode._id;
  		var newlyCreatedNode=PFMEAs.insert(newNode);
  		PFMEAs.update({_id:parentNodeID},{$push: {subcategories: newlyCreatedNode}});
  		buildNewEffect(newlyCreatedNode, oldNodeDetail.subcategories[0],"New Potential Effect(s)");
  		};

var stuffArray = function() {
	var i,j,k,l;
	var processFunctionCursor=[];
	var currentRow=new Array();
	var stuffArray=new Array();
	var rowCount=0;
	currentRow=[];
	if (Session.get('currentPFMEA') && pfmeaSubscription.ready())
	{	var rootNode=PFMEAs.findOne({_id: Session.get('currentPFMEA')}); // need to make sure it's the right DFMEA
		processFunctionCursor=PFMEAs.find({_id: {$in: rootNode.subcategories}},{sort: {sortOrder: 1}}); 
		var currentNode=processFunctionCursor.fetch();
		for (i=0; i<processFunctionCursor.count(); i++) {
			var stuffObj={};
			_.extend(stuffObj,currentNode[i],{rowSpan: 1});
			var PFchildren=currentNode[i].subcategories;
			currentRow.push(stuffObj);
			var failureModeCursor=PFMEAs.find({_id: {$in: PFchildren}},{sort: {sortOrder: 1}});
			var currentNode2=failureModeCursor.fetch();
			for (j=0; j< PFchildren.length; j++){
				var stuffObject={};
				_.extend(stuffObject,currentNode2[j],{rowSpan:1});
				currentRow.push(stuffObject);
				var FMchildren=currentNode2[j].subcategories;
				var failureEffectsCursor=PFMEAs.find({_id: {$in: FMchildren}},{sort: {sortOrder: 1}});
				var currentNode3=failureEffectsCursor.fetch();
				for (k=0; k< FMchildren.length; k++) {
					var stuffObject3={};
					_.extend(stuffObject3,currentNode3[k],{rowSpan:currentNode3[k].subcategories.length});
					currentRow.push(stuffObject3);
					var FEchildren=currentNode3[k].subcategories;
					var failureCauseCursor=PFMEAs.find({_id: {$in: FEchildren}},{sort: {sortOrder: 1}});
					var currentNode4=failureCauseCursor.fetch();
					for (l=0; l< FEchildren.length; l++) {
						var stuffObject4={};
						_.extend(stuffObject4,currentNode4[l],{rowSpan: 1});
						currentRow.push(stuffObject4);
						stuffArray.push(currentRow);
						currentRow=[];
						rowCount++;
					}
				}
			}
		}
	var firstPointer=0, secondPointer=0,rowLength, oldRowLength=1000000;
	for (i=0; i<rowCount; i++) {
		
		rowLength=stuffArray[i].length;
		if (rowLength>3)
		{
			stuffArray[firstPointer][0].rowSpan=i-firstPointer;
			firstPointer=i;
		}
		if ((rowLength>2)) {
			stuffArray[secondPointer][stuffArray[secondPointer].length-3].rowSpan=i-secondPointer;
			secondPointer=i;
		}
		oldRowLength=rowLength;
	}
	stuffArray[firstPointer][0].rowSpan=i-firstPointer;
	stuffArray[secondPointer][stuffArray[secondPointer].length-3].rowSpan=i-secondPointer;
		return stuffArray;
	}
	else 
		{
			return "";
		}
}

Template.pfmea.helpers ({
	scopeItem: function() {
		headerNode=PFMEAs.findOne({_id: Session.get("currentPFMEA")});
		if (headerNode)
			return headerNode.content;
	},
  titleItem: function() {
    headerNode=PFMEAs.findOne({_id: Session.get("currentPFMEA")});
    if (headerNode)
      if (headerNode.header)
        return headerNode.header.title;
  },
	Major: function(){
		headerNode=PFMEAs.findOne({_id: Session.get("currentPFMEA")});
		if (headerNode)
			return headerNode.revision.major;
	},
	Minor: function() {
		headerNode=PFMEAs.findOne({_id: Session.get("currentPFMEA")});
		if (headerNode)
			return headerNode.revision.minor;
	},
	createDate: function(){
		headerNode=PFMEAs.findOne({_id: Session.get("currentPFMEA")});
		if (headerNode)
		{
		var d= new Date(headerNode.header.creation_date);
		var retval=String(d.getMonth()+1)
		retval+="/"+d.getDate()+"/"+d.getFullYear();
		return retval;
		}
	},
	revisedDate: function() {
		headerNode=PFMEAs.findOne({_id: Session.get("currentPFMEA")});
		if (headerNode)
		{
		var d= new Date(headerNode.header.revision_date);
		var retval=String(d.getMonth()+1)
		retval+="/"+d.getDate()+"/"+d.getFullYear();
		return retval;
		}
	},
	rowOfArray: function(){
		return stuffArray();
	},
	processRow: function() {
		return this;
	},
	rowSpan: function() {
		return this.rowSpan;
	},
	processEffect: function() {
		return this.nodeKind==="failureEffects";
	},
	processCause: function() {
		return this.nodeKind==="failureCauses";
	},
	RPN: function() {
		var SEV=PFMEAs.findOne({_id:this.parentCategory}).SEV;
		var retval = this.DET*this.OCC*SEV;
		return retval;
	},
	canEdit: function() {
		return true;  // need to put in logic to check permissions
	},
	deletable: function() {
		var parent=PFMEAs.findOne({_id: this.parentCategory});
		if ((parent) && parent.subcategories && parent.subcategories.length > 1)
			return true;
		else return false;
	},
	RAILitems: function() {
		return false;
	},
	editing: function(editType) {
		if (editType)
			return (Session.equals('editing_itemname', this._id) && (Session.equals('editField', editType)) && Template.pfmea.canEdit());  //need to fix the display on this		
		else
			return (Session.equals('editing_itemname', this._id) && Template.pfmea.canEdit());
  },
  updateRecentDocuments: function() {
    var currDoc=Session.get("currentDFMEA");
    //write the push statemt to timestamp it and insert or update.
    if(Accounts.loginServicesConfigured() && currDoc)
      {
      var retval, i, foundFlag=false, foundIndex=0, removedVal;
      var docList=Meteor.user().documentsVisited;
      if (docList)
      {
      for (i=0; i<docList.length; i++)
        {
        if (docList[i].docID === currDoc){
            foundFlag=true;
            foundIndex=i;
        }}
      if (foundFlag)
      {
        removedVal=docList.splice(foundIndex,1);
        docList.unshift(removedVal[0]);
      }
      else
      {
        docList.unshift({docID: currDoc, docType: "DFMEA"});
      }
      retval=docList.slice(0,10);
      Meteor.users.update({_id:Meteor.userId()}, {$set: {documentsVisited: retval}});
    }}}
});

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

Template.pfmea.events(okCancelEvents(
  '#content-input',
  {
    ok: function (text, evt) {
      PFMEAs.update({_id: this._id},{
        $set: {content: text,
        timestamp: (new Date()).getTime(),
      }});
      Session.set("editing_itemname", null);
      Session.set('editField',null);
    },
	cancel: function () {
      Session.set('editing_itemname', null);
      Session.set('editField',null);
    }})
);

Template.pfmea.events(okCancelEvents(
  '#SEV-input',
  {
    ok: function (text, evt) {
      PFMEAs.update({_id: this._id},{
        $set: {SEV: text,
        timestamp: (new Date()).getTime(),
      }});
      Session.set("editing_itemname", null);
      Session.set('editField',null);
    },
	cancel: function () {
      Session.set('editing_itemname', null);
      Session.set('editField',null);
    }})
);

Template.pfmea.events(okCancelEvents(
  '#OCC-input',
  {
    ok: function (text, evt) {
      PFMEAs.update({_id: this._id},{
        $set: {OCC: text,
        timestamp: (new Date()).getTime(),
      }});
      Session.set("editing_itemname", null);
      Session.set('editField',null);
    },
	cancel: function () {
      Session.set('editing_itemname', null);
      Session.set('editField',null);
    }})
);


Template.pfmea.events(okCancelEvents(
  '#DET-input',
  {
    ok: function (text, evt) {
      PFMEAs.update({_id: this._id},{
        $set: {DET: text,
        timestamp: (new Date()).getTime(),
      }});
      Session.set("editing_itemname", null);
      Session.set('editField',null);
    },
	cancel: function () {
      Session.set('editing_itemname', null);
      Session.set('editField',null);
    }})
);

Template.pfmea.events(okCancelEvents(
  '#class-input',
  {
    ok: function (text, evt) {
      PFMEAs.update({_id: this._id},{
        $set: {classification: text,
        timestamp: (new Date()).getTime(),
      }});
      Session.set("editing_itemname", null);
      Session.set('editField',null);
    },
	cancel: function () {
      Session.set('editing_itemname', null);
      Session.set('editField',null);
    }})
);

Template.pfmea.events(okCancelEvents(
  '#processControl-input',
  {
    ok: function (text, evt) {
      PFMEAs.update({_id: this._id},{
        $set: {processControl: text,
        timestamp: (new Date()).getTime(),
      }});
      Session.set("editing_itemname", null);
      Session.set('editField',null);
    },
	cancel: function () {
      Session.set('editing_itemname', null);
      Session.set('editField',null);
    }})
);

Template.pfmea.events(okCancelEvents(
  '#scope-input',
  {
    ok: function (text, evt) {
      PFMEAs.update({_id: Session.get("currentDFMEA")},{
        $set: {content: text,
        timestamp: (new Date()).getTime(),
      }});
      Session.set("editing_itemname", null);
      Session.set('editField',null);
    },
	cancel: function () {
      Session.set('editing_itemname', null);
      Session.set('editField',null);
    }})
);
Template.pfmea.events(okCancelEvents(
  '#title-input',
  {
    ok: function (text, evt) {
      PFMEAs.update({_id: Session.get("currentDFMEA")},{
        $set: {"header.title": text,
        timestamp: (new Date()).getTime(),
      }});
      Session.set("editing_itemname", null);
      Session.set('editField',null);
    },
  cancel: function () {
      Session.set('editing_itemname', null);
      Session.set('editField',null);
    }})
);
Template.pfmea.events ({
  'click .destroy': function () {
    return null;
  },
  'click .scopeEdit': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Session.set('editField',"Scope");
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#scope-input"));
  },
  'click .titleEdit': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Session.set('editField',"Title");
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#title-input"));
  },
  'click .nodeContent': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Session.set('editField',"Content");
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#content-input"));
  },
   'click .SEV': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Session.set('editField',"SEV");
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#SEV-input"));
  },   
  'click .Classification': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Session.set('editField',"Class");
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#class-input"));
  },
   'click .processControl': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Session.set('editField',"processControl");
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#processControl-input"));
  }, 
  'click .OCC': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Session.set('editField',"OCC");
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#OCC-input"));
  },
   'click .DET': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Session.set('editField',"DET");
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#DET-input"));
  },
  'click .btn-processFunction-add': function(evt) {
  		if (this)
  		{
      evt.stopPropagation();
  		var newFunctionNode=new Object;
  		jQuery.extend(newFunctionNode, this);
  		newFunctionNode.timestamp=(new Date()).getTime();
  		newFunctionNode.content="New Function";
  		newFunctionNode.rowSpan=1;
  		newFunctionNode.subcategories=[];
  		delete newFunctionNode._id;
  		var parentNode=PFMEAs.findOne({_id: this.parentCategory});
  		var catLength=parentNode.subcategories.length;
  		var peers=parentNode.subcategories;
  		var position=-1;
  		if (catLength>1)
  			{
  				_.sortBy(peers,function(item) {return PFMEAs.findOne({_id:item},{sortOrder:1}).sortOrder});
  				position=peers.indexOf(this._id);
  			}
  		else position=0;
  		if (position>=catLength-1)
  			newFunctionNode.sortOrder=this.sortOrder*2;
  		else
  		{
  			nextSortOrder=PFMEAs.findOne({_id:peers[position+1]},{sortOrder:1}).sortOrder;
  			newFunctionNode.sortOrder=0.5*(this.sortOrder+nextSortOrder);
  		}
  		var newFunction=PFMEAs.insert(newFunctionNode);
  		peers.splice(position+1,0,String(newFunction));		
  		PFMEAs.update({_id:newFunctionNode.parentCategory},
  					{$set:{subcategories: peers}});
  		buildNewFM(newFunction,this.subcategories[0],"New Failure Mode");
  		}
  },
  'click .btn-failureMode-add': function(evt) {
   		if (this)
  		{
      evt.stopPropagation();
  		var newFMNode=new Object;
  		jQuery.extend(newFMNode, this);
  		newFMNode.timestamp=(new Date()).getTime();
  		newFMNode.content="New Failure Mode";
  		newFMNode.rowSpan=1;
  		newFMNode.subcategories=[];
  		delete newFMNode._id;
  		var parentNode=PFMEAs.findOne({_id: this.parentCategory});
  		var catLength=parentNode.subcategories.length;
  		var peers=parentNode.subcategories;
  		var position=-1;
  		if (catLength>1)
  			{
  				_.sortBy(peers,function(item) {return PFMEAs.findOne({_id:item},{sortOrder:1}).sortOrder});
  				position=peers.indexOf(this._id);
  			}
  		else position=0;
  		if (position>=catLength-1)
  			newFMNode.sortOrder=this.sortOrder*2;
  		else
  		{
  			nextSortOrder=PFMEAs.findOne({_id:peers[position+1]},{sortOrder:1}).sortOrder;
  			newFMNode.sortOrder=0.5*(this.sortOrder+nextSortOrder);
  		}
  		var newFunction=PFMEAs.insert(newFMNode);
  		peers.splice(position+1,0,String(newFunction));		
  		PFMEAs.update({_id:newFMNode.parentCategory},
  					{$set:{subcategories: peers}});
   		buildNewEffect(newFunction, this.subcategories[0],"New Potential Effect(s)");

  		}
  },
  'click .btn-failureEffects-add': function(evt) {
   		if (this)
  		{
      evt.stopPropagation();
  		var newFMNode=new Object;
  		jQuery.extend(newFMNode, this);
  		newFMNode.timestamp=(new Date()).getTime();
  		newFMNode.content="New Potential Effect(s)";
  		newFMNode.rowSpan=1;
  		newFMNode.subcategories=[];
  		newFMNode.SEV=10;
  		newFMNode.Classification=" ";
  		delete newFMNode._id;
  		var parentNode=PFMEAs.findOne({_id: this.parentCategory});
  		var catLength=parentNode.subcategories.length;
  		var peers=parentNode.subcategories;
  		var position=-1;
  		if (catLength>1)
  			{
  				_.sortBy(peers,function(item) {return PFMEAs.findOne({_id:item},{sortOrder:1}).sortOrder});
  				position=peers.indexOf(this._id);
  			}
  		else position=0;
  		if (position>=catLength-1)
  			newFMNode.sortOrder=this.sortOrder*2;
  		else
  		{
  			nextSortOrder=PFMEAs.findOne({_id:peers[position+1]},{sortOrder:1}).sortOrder;
  			newFMNode.sortOrder=0.5*(this.sortOrder+nextSortOrder);
  		}
  		var newFunction=PFMEAs.insert(newFMNode);
  		peers.splice(position+1,0,String(newFunction));		
  		PFMEAs.update({_id:newFMNode.parentCategory},
  					{$set:{subcategories: peers}});
  		buildNewCause(newFunction, this.subcategories[0],"Potential Cause(s)");

  		}
  },
    'click .btn-failureCauses-add': function(evt) {
      evt.stopPropagation();
   		if (this)
  		{
  		var newFMNode=new Object;
  		jQuery.extend(newFMNode, this);
  		newFMNode.timestamp=(new Date()).getTime();
  		newFMNode.content="Potential Causes(s)";
  		newFMNode.rowSpan=1;
  		newFMNode.subcategories=[];
  		newFMNode.OCC=10;
  		newFMNode.DET=10;
		newFMNode.processControl="Design Control(s)";

  		delete newFMNode._id;
  		var parentNode=PFMEAs.findOne({_id: this.parentCategory});
  		var catLength=parentNode.subcategories.length;
  		var peers=parentNode.subcategories;
  		var position=-1;
  		if (catLength>1)
  			{
  				_.sortBy(peers,function(item) {return PFMEAs.findOne({_id:item},{sortOrder:1}).sortOrder});
  				position=peers.indexOf(this._id);
  			}
  		else position=0;
  		if (position>=catLength-1)
  			newFMNode.sortOrder=this.sortOrder*2;
  		else
  		{
  			nextSortOrder=PFMEAs.findOne({_id:peers[position+1]},{sortOrder:1}).sortOrder;
  			newFMNode.sortOrder=0.5*(this.sortOrder+nextSortOrder);
  		}
  		var newFunction=PFMEAs.insert(newFMNode);
  		peers.splice(position+1,0,String(newFunction));		
  		PFMEAs.update({_id:newFMNode.parentCategory},
  					{$set:{subcategories: peers}});
  		}
  },
  'click .btn-processFunction-delete, click .btn-failureMode-delete, click .btn-failureEffects-delete, click .btn-failureCauses-delete': function(evt) {
    evt.stopPropagation();
    if (this)
  	{
  		var self=this;
  		if (this.parentCategory)
  			PFMEAs.update({_id: this.parentCategory},{$pull: {subcategories: this._id}}); //unhook from parent
  			PFMEAs.update({_id: String(this.rootID)},{$push: {undoStack: this._id}});
  	}
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
  	Meteor.call("deepClone",Session.get("currentDFMEA"),PFMEAs);
  	PFMEAs.update({_id: Session.get("currentDFMEA")},{
  													$set: {"revision.minor": Template.pfmea.Minor()+1,
  															"header.revision_date": (new Date()).getTime()}});
  },
  'click .btn-rev-major': function() {
  	Meteor.call("deepClone",Session.get("currentDFMEA"),PFMEAs);
   	PFMEAs.update({_id: Session.get("currentDFMEA")},{
  													$set: {"revision.major": Template.pfmea.Major()+1,
  															"revision.minor": 0,
  															"header.revision_date": (new Date()).getTime()}});
  }
})