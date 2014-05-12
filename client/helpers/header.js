var DFMEAsubscription=Meteor.subscribe('dfmeas');

Template.header.helpers ({
	anyProjects: function() {
		if (Accounts.loginServicesConfigured())
		{

			if(Meteor.user() && Meteor.user().projectsVisited)
				var retval= Meteor.user().projectsVisited;

				return retval;
		}
		else return null;
	},
	projectID: function() {
		return (this.projectID);
	},
	moduleName: function() {
		if (Session.get("moduleName"))
		return (Session.get("moduleName"));
		return null;
	},
	retrieveProject: function() {
		if (this.projectID)
		{	

			var namedProject=Projects.findOne(this.projectID);

			if ((namedProject) && (namedProject.projectName))
				return namedProject.projectName;
		}
		return "";
	},
	anyDocs: function() {
		if (Accounts.loginServicesConfigured())
		{

			if(Meteor.user() && Meteor.user().documentsVisited)
				var retval= Meteor.user().documentsVisited;

				return retval;
		}
		else return null;
	},
	docID: function() {
		return (this.docID);
	},
	retrieveDocument: function() {
		if (this.docID)
		{	
			switch (this.docType) {
				case "DFMEA" :
					var namedDocument=DFMEAs.findOne({_id:this.docID});
					if (namedDocument && (namedDocument.header) && (namedDocument.header.title))
						return namedDocument.header.title;
					else return "";
					break;
				case "PFMEA" :
					var namedDocument=PFMEAs.findOne({_id:this.docID});
					if (namedDocument && (namedDocument.header) && (namedDocument.header.title))
						return namedDocument.header.title;
					else return "";
					break;
				default: return "";
			}

		}
		return "";
	},
	retrieveDocType: function() {
		if (this.docID)
				return this.docType;
		return "";
	},	
	retrieveDocID: function() {
		if (this.docID)
				return this.docID;
		return "";
	}
})

Template.header.events({
  'click #helpButton': function() {
  	$('#helpOnProjects').modal();
  },
  'click .btn-help': function() {
  	if (this)
  	{
  		$('#helpOnProjects').modal();
  	}
  },
})