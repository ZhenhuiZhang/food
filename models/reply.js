var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var ReplySchema = new Schema({
  comment: { type: String },
  food: [{ type: String}],
  pic: [{ type: String }],
  score: { type: Number },
  reply_id: { type: String }, //评论用户id
  topic_id: { type: String }, //商家id
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  deleted: {type: Boolean, default: false},
});

ReplySchema.plugin(BaseModel);
ReplySchema.index({topic_id: 1});

mongoose.model('Reply', ReplySchema);
