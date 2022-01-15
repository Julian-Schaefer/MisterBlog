docker rm blogify-postgres
docker run -d -p 5432:5432 --name blogify-postgres -e POSTGRES_PASSWORD=blogifypassword postgres
sleep 5
cd src
pipenv run flask db upgrade
cd ..