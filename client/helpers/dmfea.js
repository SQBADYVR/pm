// Need to make help lessons
// Need to fix security for write access to matrix
// Need to fix security for write to remote file
// Need to fix revisioining
// Need to build out the choose DFMEA
// Need to build out nested DFMEA
// Need to build out autogenerating FM

DFMEAs=new Meteor.Collection('dfmeas');
var dfmeaSubscription=Meteor.subscribe('dfmeas');
var selfSubscription=Meteor.subscribe('self');
var colleagueSubscription=Meteor.subscribe('colleagues');
var headerNode=null;

var buildNewCause = function(parentNodeID,oldNode,promptText)  {
  		var newNode=new Object;
  		var oldNodeDetail=DFMEAs.findOne({_id:oldNode});
  		jQuery.extend(newNode, oldNodeDetail);
  		newNode.timestamp=(new Date()).getTime();
  		newNode.content=promptText;
  		newNode.rowSpan=1;
  		newNode.subcategories=[];
  		newNode.parentCategory=parentNodeID;
  		newNode.OCC=10;
  		newNode.DET=10;
  		newNode.designControl="Design Control(s)"
  		delete newNode._id;
  		var newlyCreatedNode=DFMEAs.insert(newNode);
  		DFMEAs.update({_id:parentNodeID},{$push: {subcategories: newlyCreatedNode}});
   		};

var buildNewEffect = function(parentNodeID,oldNode,promptText)  {
  		var newNode=new Object;
  		var oldNodeDetail=DFMEAs.findOne({_id:oldNode});
  		jQuery.extend(newNode, oldNodeDetail);
  		newNode.timestamp=(new Date()).getTime();
  		newNode.content=promptText;
  		newNode.rowSpan=1;
  		newNode.subcategories=[];
  		newNode.parentCategory=parentNodeID;
  		newNode.SEV=10;
  		newNode.Classification="";
  		delete newNode._id;
  		var newlyCreatedNode=DFMEAs.insert(newNode);
  		DFMEAs.update({_id:parentNodeID},{$push: {subcategories: newlyCreatedNode}});
  		buildNewCause(newlyCreatedNode, oldNodeDetail.subcategories[0],"Potential Cause(s)");
  		};

var buildNewFM = function(parentNodeID,oldNode,promptText)  {
  		var newNode=new Object;
  		var oldNodeDetail=DFMEAs.findOne({_id:oldNode});
  		jQuery.extend(newNode, oldNodeDetail);
  		newNode.timestamp=(new Date()).getTime();
  		newNode.content=promptText;
  		newNode.rowSpan=1;
  		newNode.subcategories=[];
  		newNode.parentCategory=parentNodeID;
  		delete newNode._id;
  		var newlyCreatedNode=DFMEAs.insert(newNode);
  		DFMEAs.update({_id:parentNodeID},{$push: {subcategories: newlyCreatedNode}});
  		buildNewEffect(newlyCreatedNode, oldNodeDetail.subcategories[0],"New Potential Effect(s)");
  		};

var stuffArray = function() {
	var i,j,k,l;
	var designFunctionCursor=[];
	var currentRow=new Array();
	var stuffArray=new Array();
	var rowCount=0;
	currentRow=[];
	if (Session.get('currentDFMEA') && dfmeaSubscription.ready())
	{	var rootNode=DFMEAs.findOne({_id: Session.get('currentDFMEA')}); // need to make sure it's the right DFMEA
		designFunctionCursor=DFMEAs.find({_id: {$in: rootNode.subcategories}},{sort: {sortOrder: 1}}); 
		var currentNode=designFunctionCursor.fetch();
		for (i=0; i<designFunctionCursor.count(); i++) {
			var stuffObj={};
			_.extend(stuffObj,currentNode[i],{rowSpan: 1});
			var DFchildren=currentNode[i].subcategories;
			currentRow.push(stuffObj);
			var failureModeCursor=DFMEAs.find({_id: {$in: DFchildren}},{sort: {sortOrder: 1}});
			var currentNode2=failureModeCursor.fetch();
			for (j=0; j< DFchildren.length; j++){
				var stuffObject={};
				_.extend(stuffObject,currentNode2[j],{rowSpan:1});
				currentRow.push(stuffObject);
				var FMchildren=currentNode2[j].subcategories;
				var failureEffectsCursor=DFMEAs.find({_id: {$in: FMchildren}},{sort: {sortOrder: 1}});
				var currentNode3=failureEffectsCursor.fetch();
				for (k=0; k< FMchildren.length; k++) {
					var stuffObject3={};
					_.extend(stuffObject3,currentNode3[k],{rowSpan:currentNode3[k].subcategories.length});
					currentRow.push(stuffObject3);
					var FEchildren=currentNode3[k].subcategories;
					var failureCauseCursor=DFMEAs.find({_id: {$in: FEchildren}},{sort: {sortOrder: 1}});
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

Template.dfmea.helpers ({
	scopeItem: function() {
		headerNode=DFMEAs.findOne({_id: Session.get("currentDFMEA")});
		if (headerNode)
			return headerNode.content;
	},
  titleItem: function() {
    headerNode=DFMEAs.findOne({_id: Session.get("currentDFMEA")});
    if (headerNode)
      if (headerNode.header)
        return headerNode.header.title;
  },
	Major: function(){
		headerNode=DFMEAs.findOne({_id: Session.get("currentDFMEA")});
		if (headerNode)
			return headerNode.revision.major;
	},
	Minor: function() {
		headerNode=DFMEAs.findOne({_id: Session.get("currentDFMEA")});
		if (headerNode)
			return headerNode.revision.minor;
	},
	createDate: function(){
		headerNode=DFMEAs.findOne({_id: Session.get("currentDFMEA")});
		if (headerNode)
		{
		var d= new Date(headerNode.header.creation_date);
		var retval=String(d.getMonth()+1)
		retval+="/"+d.getDate()+"/"+d.getFullYear();
		return retval;
		}
	},
	revisedDate: function() {
		headerNode=DFMEAs.findOne({_id: Session.get("currentDFMEA")});
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
	designEffect: function() {
		return this.nodeKind==="failureEffects";
	},
	designCause: function() {
		return this.nodeKind==="failureCauses";
	},
	RPN: function() {
		var SEV=DFMEAs.findOne({_id:this.parentCategory}).SEV;
		var retval = this.DET*this.OCC*SEV;
		return retval;
	},
	canEdit: function() {
		return true;  // need to put in logic to check permissions
	},
	deletable: function() {
		var parent=DFMEAs.findOne({_id: this.parentCategory});
		if ((parent) && parent.subcategories && parent.subcategories.length > 1)
			return true;
		else return false;
	},
	RAILitems: function() {
		return false;
	},
	editing: function(editType) {
		if (editType)
			return (Session.equals('editing_itemname', this._id) && (Session.equals('editField', editType)) && Template.dfmea.canEdit());  //need to fix the display on this		
		else
			return (Session.equals('editing_itemname', this._id) && Template.dfmea.canEdit());
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

Template.dfmea.events(okCancelEvents(
  '#content-input',
  {
    ok: function (text, evt) {
      DFMEAs.update({_id: this._id},{
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

Template.dfmea.events(okCancelEvents(
  '#SEV-input',
  {
    ok: function (text, evt) {
      DFMEAs.update({_id: this._id},{
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

Template.dfmea.events(okCancelEvents(
  '#OCC-input',
  {
    ok: function (text, evt) {
      DFMEAs.update({_id: this._id},{
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


Template.dfmea.events(okCancelEvents(
  '#DET-input',
  {
    ok: function (text, evt) {
      DFMEAs.update({_id: this._id},{
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

Template.dfmea.events(okCancelEvents(
  '#class-input',
  {
    ok: function (text, evt) {
      DFMEAs.update({_id: this._id},{
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

Template.dfmea.events(okCancelEvents(
  '#designControl-input',
  {
    ok: function (text, evt) {
      DFMEAs.update({_id: this._id},{
        $set: {designControl: text,
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

Template.dfmea.events(okCancelEvents(
  '#scope-input',
  {
    ok: function (text, evt) {
      DFMEAs.update({_id: Session.get("currentDFMEA")},{
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
Template.dfmea.events(okCancelEvents(
  '#title-input',
  {
    ok: function (text, evt) {
      DFMEAs.update({_id: Session.get("currentDFMEA")},{
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
Template.dfmea.events ({
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
   'click .designControl': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Session.set('editField',"designControl");
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#designControl-input"));
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
  'click .btn-designFunction-add': function(evt) {
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
  		var parentNode=DFMEAs.findOne({_id: this.parentCategory});
  		var catLength=parentNode.subcategories.length;
  		var peers=parentNode.subcategories;
  		var position=-1;
  		if (catLength>1)
  			{
  				_.sortBy(peers,function(item) {return DFMEAs.findOne({_id:item},{sortOrder:1}).sortOrder});
  				position=peers.indexOf(this._id);
  			}
  		else position=0;
  		if (position>=catLength-1)
  			newFunctionNode.sortOrder=this.sortOrder*2;
  		else
  		{
  			nextSortOrder=DFMEAs.findOne({_id:peers[position+1]},{sortOrder:1}).sortOrder;
  			newFunctionNode.sortOrder=0.5*(this.sortOrder+nextSortOrder);
  		}
  		var newFunction=DFMEAs.insert(newFunctionNode);
  		peers.splice(position+1,0,String(newFunction));		
  		DFMEAs.update({_id:newFunctionNode.parentCategory},
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
  		var parentNode=DFMEAs.findOne({_id: this.parentCategory});
  		var catLength=parentNode.subcategories.length;
  		var peers=parentNode.subcategories;
  		var position=-1;
  		if (catLength>1)
  			{
  				_.sortBy(peers,function(item) {return DFMEAs.findOne({_id:item},{sortOrder:1}).sortOrder});
  				position=peers.indexOf(this._id);
  			}
  		else position=0;
  		if (position>=catLength-1)
  			newFMNode.sortOrder=this.sortOrder*2;
  		else
  		{
  			nextSortOrder=DFMEAs.findOne({_id:peers[position+1]},{sortOrder:1}).sortOrder;
  			newFMNode.sortOrder=0.5*(this.sortOrder+nextSortOrder);
  		}
  		var newFunction=DFMEAs.insert(newFMNode);
  		peers.splice(position+1,0,String(newFunction));		
  		DFMEAs.update({_id:newFMNode.parentCategory},
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
  		var parentNode=DFMEAs.findOne({_id: this.parentCategory});
  		var catLength=parentNode.subcategories.length;
  		var peers=parentNode.subcategories;
  		var position=-1;
  		if (catLength>1)
  			{
  				_.sortBy(peers,function(item) {return DFMEAs.findOne({_id:item},{sortOrder:1}).sortOrder});
  				position=peers.indexOf(this._id);
  			}
  		else position=0;
  		if (position>=catLength-1)
  			newFMNode.sortOrder=this.sortOrder*2;
  		else
  		{
  			nextSortOrder=DFMEAs.findOne({_id:peers[position+1]},{sortOrder:1}).sortOrder;
  			newFMNode.sortOrder=0.5*(this.sortOrder+nextSortOrder);
  		}
  		var newFunction=DFMEAs.insert(newFMNode);
  		peers.splice(position+1,0,String(newFunction));		
  		DFMEAs.update({_id:newFMNode.parentCategory},
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
		newFMNode.designControl="Design Control(s)";

  		delete newFMNode._id;
  		var parentNode=DFMEAs.findOne({_id: this.parentCategory});
  		var catLength=parentNode.subcategories.length;
  		var peers=parentNode.subcategories;
  		var position=-1;
  		if (catLength>1)
  			{
  				_.sortBy(peers,function(item) {return DFMEAs.findOne({_id:item},{sortOrder:1}).sortOrder});
  				position=peers.indexOf(this._id);
  			}
  		else position=0;
  		if (position>=catLength-1)
  			newFMNode.sortOrder=this.sortOrder*2;
  		else
  		{
  			nextSortOrder=DFMEAs.findOne({_id:peers[position+1]},{sortOrder:1}).sortOrder;
  			newFMNode.sortOrder=0.5*(this.sortOrder+nextSortOrder);
  		}
  		var newFunction=DFMEAs.insert(newFMNode);
  		peers.splice(position+1,0,String(newFunction));		
  		DFMEAs.update({_id:newFMNode.parentCategory},
  					{$set:{subcategories: peers}});
  		}
  },
  'click .btn-designFunction-delete, click .btn-failureMode-delete, click .btn-failureEffects-delete, click .btn-failureCauses-delete': function(evt) {
    evt.stopPropagation();
    if (this)
  	{
  		var self=this;
  		if (this.parentCategory)
  			DFMEAs.update({_id: this.parentCategory},{$pull: {subcategories: this._id}}); //unhook from parent
  			DFMEAs.update({_id: String(this.rootID)},{$push: {undoStack: this._id}});
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
  	Meteor.call("deepClone",Session.get("currentDFMEA"),DFMEAs);
  	DFMEAs.update({_id: Session.get("currentDFMEA")},{
  													$set: {"revision.minor": Template.dfmea.Minor()+1,
  															"header.revision_date": (new Date()).getTime()}});
  },
  'click .btn-rev-major': function() {
  	Meteor.call("deepClone",Session.get("currentDFMEA"),DFMEAs);
   	DFMEAs.update({_id: Session.get("currentDFMEA")},{
  													$set: {"revision.major": Template.dfmea.Major()+1,
  															"revision.minor": 0,
  															"header.revision_date": (new Date()).getTime()}});
  }
})