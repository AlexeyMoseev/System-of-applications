#export FLASK_APP=app
#export FLASK_ENV=development
#export DATABASE='postgres://postgres@localhost/test_db'
export DATABASE='sqlite:///prod.db'
#flask init-db
#flask run
#--host='192.168.0.100'
PYTHONPATH=. python app/model/admin/offers.py
