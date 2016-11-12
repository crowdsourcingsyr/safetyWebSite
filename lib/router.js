Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {name: 'CrimeMap'});
Router.route('/SocialMedia',{
  name: 'SocialMedia',
  waitOn(){
    return Meteor.subscribe("Aonly");
  }
});
