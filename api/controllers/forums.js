var express = require("express");
var router = express.Router();
var passport = require("passport")

var db = require("../../mongoose");

router.get('/categories',function(req, res){
	db.forumCategory.find({parentCategory:null}).populate('subCategories').sort({orderIndex:1}).exec(function(err, categories){
		res.json(categories)
	})
})

router.get('/category/:categoryId', function(req, res){
	db.forumCategory.findOne({_id:req.params.categoryId}).populate({path: 'threads', populate:[{path:'startedBy', model:'onyxUser', select:'username'},{path:'posts', model:'forumPost'}]}).exec(function(err, cat){
		res.json(cat)
	})
	// db.forumThread.find({category:req.params.categoryId}).exec(function(err, threads){
	// 	res.json(threads)
	// })
})

router.get('/thread/:threadId', function(req,res){
	db.forumThread.findOne({_id:req.params.threadId}).populate({path:'posts category', populate: {path: 'author', select:'username'}}).exec(function(err, thread){
		res.json(thread)
	})
})

router.get('/sitenews', function(req,res){
	db.forumCategory.findOne({name:'Front Page News'}).populate({path: 'threads',options:{sort:{'firstPostTime':-1},limit:5}, populate:[{path:'startedBy', model:'onyxUser', select:'username'},{path:'posts', model:'forumPost', options:{limit:50}}]}).exec(function(err, cat){
		res.json(cat)
	})
})

//create post in thread
router.post("/thread/:threadId", function(req, res){
	passport.authenticate('jwt', function(err, user, info) {
		if (user) {
			if(!user.isEmailValidated){
				return res.status(401).json({error:"You must validate your email before you can make a post."})
			}
			if(!req.body.message){
				return res.status(401).json({error:"You cannot post an empty message."})
			}
			db.forumThread.findOne({_id:req.params.threadId}).populate('posts').exec(function(err, thread){
				if(err||!thread){
					return res.status(401).json({error:"Error making post, please try again."})
				}
				db.forumPost.create({
					thread: thread,
					author: user,
					message: req.body.message
				}, function(err, post){
					if(err||!post){
						return res.status(401).json({error:"Error making post, please try again."})
					}
					thread.posts.push(post)
					thread.lastPost = post
					thread.save(function(){
						res.json({result:"Success"})
					})
				})
			})
  		} else {
	  		return res.status(401).json({error:"You must be logged in to post a message."})
		}
	})(req, res)
})

//create thread in category
router.post("/category/:categoryId", function(req, res){
	passport.authenticate('jwt', function(err, user, info) {
		if (user) {
			if(!user.isEmailValidated){
				return res.status(401).json({error:"You must validate your email before you can make a post."})
			}
			if(!req.body.message){
				return res.status(401).json({error:"You cannot post an empty message."})
			}
			if(!req.body.title){
				return res.status(401).json({error:"You must provide a title for your post."})
			}
			var title = req.body.title
			var message = req.body.message
			db.forumCategory.findOne({_id:req.params.categoryId}).populate('threads').exec(function(err, cat){
				if(cat.permissions.createThread.indexOf(user.userLevel)===-1){
					return res.status(401).json({error:"You do not have the permissions to create a thread in this forum."})
				}
				if(err||!cat){
					return res.status(401).json({error:"Error making post, please try again."})
				}
				db.forumThread.create({
					name: title,
					category: cat,
					startedBy: user,
				},function(err, thread){
					if(err||!thread){
						return res.status(401).json({error:"Error making post, please try again."})
					}
					db.forumPost.create({
						thread: thread,
						author: user,
						message: message
					}, function(err, post){
						if(err||!post){
							return res.status(401).json({error:"Error making post, please try again."})
						}
						thread.posts.push(post)
						thread.lastPost = post
						thread.save(function(){
							cat.threads.push(thread)
							cat.save(function(){
								res.json({result:"Success"})
							})
						})
					})
				})
			})
  		} else {
	  		return res.status(401).json({error:"You must be logged in to post a message."})
		}
	})(req, res)
})

router.post('/category', function(req, res){
	passport.authenticate('jwt', function(err, user, info) {
		if(err||!user){
			return res.status(401).json({error:"You must be logged in to create a category."})	
		}
		if(user.userLevel!==1){
			return res.status(401).json({error:"You do not have permission to create a category"})
		}
		if(!req.body||!req.body.name){
			return res.status(400).json({error:"You must give the category a name."})
		}
		db.forumCategory.create({
			name: req.body.name,
			parentCategory: null,
			subCategories: [],
			threads: [],
			permissions: {
				createThread: [0,1],
				createPost: [0,1]
			}
		}, function(err, cat){
			if(err||!cat){
				return res.status(500).json({error:"There was an error creating new category"})
			}
			return res.json({result: 'success'})
		})
	})(req, res)
})

router.post('/subcategory', function(req, res){
	passport.authenticate('jwt', function(err, user, info) {
		if(err||!user){
			return res.status(401).json({error:"You must be logged in to create a category."})	
		}
		if(user.userLevel!==1){
			return res.status(401).json({error:"You do not have permission to create a category"})
		}
		if(!req.body||!req.body.name||typeof(req.body.name)!=='string'){
			return res.status(400).json({error:"You must give the category a name."})
		}
		if(!req.body.id||typeof(req.body.id)!=='string'){
			return res.status(400).json({error:"You must specify parent category's id."})
		}
		db.forumCategory.findOne({
			_id:req.body.id
		}).exec(function(err, parent){
			if(err||!parent){
				return res.status(500).json({error:"There was an error creating new category"})
			}
			db.forumCategory.create({
				name: req.body.name,
				parentCategory: parent,
				subCategories: [],
				threads: [],
				permissions: {
					createThread: [0,1],
					createPost: [0,1]
				}
			}, function(err, cat){
				if(err||!cat){
					return res.status(500).json({error:"There was an error creating new category"})
				}
				parent.subCategories.push(cat)
				parent.save(function(){
					return res.json({result: 'success'})
				})
			})
		})
	})(req, res)
})

module.exports = router