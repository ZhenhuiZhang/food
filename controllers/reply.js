var validator  = require('validator');
var _          = require('lodash');
var at         = require('../common/at');
var message    = require('../common/message');
var EventProxy = require('eventproxy');
var User       = require('../proxy').User;
var Topic      = require('../proxy').Topic;
var Reply      = require('../proxy').Reply;
var config     = require('../config');
var ReplyModel = require('../models').Reply;
var TopicModel = require('../models').Topic;
var User = require('../models').User;


/**
 * 添加回复
 */
exports.reply = function (req, res, next) {
  TopicModel.findOne({_id:req.params.reply_id},function(err,result){
      var topic = {
        food:{},
        feel:{}
      }
      if(err){
        
      }else{
        topic.food = result.food || {}
        topic.feel = result.feel || {}
      }
      res.render('reply/edit', {
        topic_id: req.params.reply_id,
        food:Object.keys(topic.food),
        feel :Object.keys(topic.feel),
      });
  })
  
};

/**
 * 添加回复
 */
exports.add = function (req, res, next) {
  // comment: { type: String },
  // food: [{ type: String}],
  // pic: [{ type: String }],
  // score: { type: Number },
  // reply_id: { type: String }, //评论用户id
  // topic_id: { type: String }, //商家id
  var feel = req.body.feel || []
  var replyItem={
    comment : req.body.comment || "",
    food : req.body.food || [],
    pic : req.body.picture || [],
    score : req.body.range || 0,
    topic_id : req.body.topic_id,
    reply_id : req.session.user._id,
  }

  var ep = EventProxy.create();
  ep.fail(next);

  ReplyModel.create(replyItem,ep.done(function (reply) {
    if (!reply) {
      ep.unbind();
      // just 404 page
      return next();
    }
    ep.emit('reply', reply);
  }))

  
  TopicModel.findOne({_id:req.body.topic_id},ep.done(function (topic) {
    feel.forEach(function (item) {
        topic.feel = topic.feel || {}
        if(topic.feel[item]){
          topic.feel[item] +=1
        }else{
          topic.feel[item] =1
        }
    })
    replyItem.food.forEach(function (item) {
        topic.food = topic.food || {}
        if(topic.food[item]){
          topic.food[item] +=1
        }else{
          topic.food[item] =1
        }
    })
    topic.score = Number((topic.score*topic.reply_count + req.body.range)/(topic.reply_count + 1)).toFixed(2)
    topic.reply_count +=1;
    TopicModel.update({_id:topic._id},topic,ep.done);
    ep.emit('topic_saved');
  }))

  ep.all('reply', 'topic_saved', function (topic) {
    User.findOne({_id:req.session.user._id}, ep.done(function (user) {
      user.score += 5;
      user.reply_count += 1;
      User.update({_id:user._id},user,ep.done)
      req.session.user = user;
      ep.emit('score_saved');
    }));
  });

  ep.all('score_saved', function () {
    res.redirect('/topic/' + req.body.topic_id );
  });
};