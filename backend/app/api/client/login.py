from werkzeug.security import check_password_hash, generate_password_hash
from flask import abort, jsonify
from app.db import db
from flask_restful import Resource, reqparse
from flask_jwt_extended import create_access_token
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.db import Client
from app.model.client import get_profile
import json

reg_parser = reqparse.RequestParser()
reg_parser.add_argument('email', required=True)
reg_parser.add_argument('password', required=True)
reg_parser.add_argument('data', required=True)

login_parser = reqparse.RequestParser()
login_parser.add_argument('email', required=True)
login_parser.add_argument('password', required=True)

class ClientProfile(Resource):
    @jwt_required
    def get(self):
        return get_profile(get_jwt_identity())

def create_token(client):
    return {'access_token' : create_access_token(identity=client.id, expires_delta=timedelta(days=30))}

class Register(Resource):
    def post(self):
        args = reg_parser.parse_args()
        pw_hash = generate_password_hash(args['password'])
        email = args['email'].lower()
        data = json.loads(args['data'], encoding='utf-8')

        client = Client(email=email, password_hash=pw_hash, data=data)
        db.session.add(client)

        try:
            db.session.commit()
        except IntegrityError:
            abort(409)

        return create_token(client)

class Login(Resource):
    def post(self):
        args = login_parser.parse_args()
        client = Client.query.with_entities(Client.id, Client.password_hash).filter_by(email=args['email'].lower()).first()

        if client and check_password_hash(client.password_hash, args['password']):
            return create_token(client)
            
        abort(401)
