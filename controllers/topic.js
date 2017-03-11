/*!
 * nodeclub - controllers/topic.js
 */

/**
 * Module dependencies.
 */

var validator = require('validator');

var at           = require('../common/at');
var User         = require('../proxy').User;
var Topic        = require('../proxy').Topic;
var TopicCollect = require('../proxy').TopicCollect;
var EventProxy   = require('eventproxy');
var tools        = require('../common/tools');
var store        = require('../common/store');
var config       = require('../config');
var _            = require('lodash');
var logger = require('../common/logger')

/**
 * Topic page
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.index = function (req, res, next) {
  function isUped(user, reply) {
    if (!reply.ups) {
      return false;
    }
    return reply.ups.indexOf(user._id) !== -1;
  }

  var topic_id = req.params.tid;
  var currentUser = req.session.user;

  if (topic_id.length !== 24) {
    return res.render404('此话题不存在或已被删除。');
  }
  var events = ['topic', 'is_collect'];
  var ep = EventProxy.create(events,
    function (topic, is_collect) {
    res.render('topic/index', {
      topic: topic,
      // author_other_topics: other_topics,
      // no_reply_topics: no_reply_topics,
      is_uped: isUped,
      is_collect: is_collect,
    });
  });

  ep.fail(next);

  Topic.getFullTopic(topic_id, ep.done(function (message, topic, replies) {
    if (message) {
      logger.error('getFullTopic error topic_id: ' + topic_id)
      return res.renderError(message);
    }

    topic.visit_count += 1;
    topic.save();

    topic.replies = replies;

    ep.emit('topic', topic);
      
  }));

  if (!currentUser) {
    ep.emit('is_collect', null);
  } else {
    TopicCollect.getTopicCollect(currentUser._id, topic_id, ep.done('is_collect'))
  }
};
