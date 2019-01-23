const contents = require('../../models').contents
const users = require('../../models').users
const comments = require('../../models').comments
const passport = require('passport')

module.exports = {
  edit (res, req, nextFn) {
    return contents
      .findById(req.params.id)
      .then(function (post) {
        if (!post) return nextFn('Post not found')

        contents.update({ url: req.body.url },
          function (err, result) {
            if (err) throw err

            console.log(`[${req.params.id}] post edited!`)
            res.send('success')
          })
      })
  },

  delete (req, res) {
    return contents
      .destroy({ where: { id: req.params.id }, truncate: { cascade: true } })
      .then(function (err, doc) {
        if (err) throw err

        console.log(`[${req.params.id}] post deleted!`)
        res.redirect('./')
      })
  },

  add (req, res) {
    return contents
      .create({
        title: req.body.title,
        url: req.body.url,
        userID: req.user.dataValues.id
      })

    // send result to client
      .then(function (contents) {
        console.log('added title', req.body.title, 'and text/url', req.body.url)
        res.status(303).redirect('/')
      })
      .catch(function (error) {
        res.status(400).send(error)
      })
  },

  addView (req, res) {
    return res.render('./submit_post', { isAuthenticated: !!req.user })
  },

  getById (req, res) {
    return contents
      .findOne({ where: { id: req.params.id } })
      .then((contents) => {
        if (!contents) {
          return res.status(404).send({
            message: 'Contents Not Found'
          })
        }
        console.log('req.user: ', req.user)
        return res.render('./content_id', {
          title: contents.title,
          url: contents.url,
          username: users.username,
          text: comments.text,
          isAuthenticated: !!req.user,
          comments: comments.list
        })
      })
      .catch((error) => res.status(400).send(error))
  },

  list (req, res) {
    return contents
      .findAll({
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'title', 'url', 'userID', 'createdAt']
      })
      .then((contents) => {
        res.render('./home', {
          contents,
          isAuthenticated: !!req.user })
      })
      .catch((error) => { res.status(400).send(error) })
  }
}
