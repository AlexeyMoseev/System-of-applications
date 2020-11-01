export FLASK_APP=app
export FLASK_ENV=production
#export DATABASE='postgres://postgres@localhost/test_db'
export DATABASE='sqlite:///prod.db'
#flask init-db

if [ "$1" == "new_db" ]
then
	python3 setup.py
	echo "Recreated DB."
fi
#flask run
#--host='192.168.0.100'
waitress-serve --listen=*:3535 --call 'app:create_app'
