const express = require('express')
const request = require('request')
const querystring = require('querystring')
const dotenv = require('dotenv');
dotenv.config();

const app = express()

// the url spotify should redirect to after authorization
const redirect_uri = 
  process.env.REDIRECT_URI || 
  'http://localhost:8888/callback/'


app.use('/', express.static('public'));

// redirect to spotify api to authorize the user 
app.get('/login', function(req, res) {
  res.redirect(
		'https://accounts.spotify.com/authorize?' +
			querystring.stringify({
				response_type: 'code',
				client_id: process.env.SPOTIFY_CLIENT_ID,
				scope:
					'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state playlist-read-private',
        redirect_uri,
        show_dialog : true
			})
	);
})

// get access token from spotify api
app.get('/callback', function(req, res) {
  let code = req.query.code || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64'))
    },
    json: true
  }

  // redirect to frontend client
  request.post(authOptions, function(error, response, body) {
    var access_token = body.access_token
    let uri = process.env.FRONTEND_URI
    res.redirect(uri + '?access_token=' + access_token)
  })
})

let port = process.env.PORT || 8888
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)