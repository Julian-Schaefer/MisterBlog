heroku git:remote -a blogify-flask
cd ..
git subtree push --prefix Flask/ heroku master
cd Flask