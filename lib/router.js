Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {
  name: 'CrimeMap',
  waitOn(){
    return Meteor.subscribe("safetyevents");
  }
  });
Router.route('/SocialMedia',{
  name: 'SocialMedia',
  waitOn(){
    return Meteor.subscribe("Aonly");
  }
});
