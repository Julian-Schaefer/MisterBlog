docker rm blogify-postgres --force
docker run -d -p 5432:5432 --name blogify-postgres -e POSTGRES_PASSWORD=blogifypassword postgres
sleep 5

rm /tmp/misterblog.db
pipenv run flask db upgrade

firebase emulators:start