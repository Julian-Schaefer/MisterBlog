heroku git:remote -a blogify-api
cd ..
git subtree push --prefix API/ heroku master
cd API