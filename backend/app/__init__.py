from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from flask_jwt_extended import JWTManager
from flask_moment import Moment
from app.api import resources
from app.db import db
import os
import json
from app.admin import resources as admin_resources

def offer_format(oa):
    return 0 if not oa else ( 1 if oa.ordered else (2 if oa.available else 3))

def create_app(test_config=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__, instance_relative_config=True)
    CORS(app)
    app.config.from_mapping(
        SQLALCHEMY_ECHO=False,
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        PROPAGATE_EXCEPTIONS=True,
        SQLALCHEMY_DATABASE_URI=os.environ['DATABASE'],
        JWT_SECRET_KEY='sad32du834gfjуо21?sdfja<<dfsj3ha!@Dsak',#os.urandom(24),
        RESTFUL_JSON={'ensure_ascii': False},
        JSON_AS_ASCII=False
    )

    db.init_app(app)

    with app.app_context():
        jwt = JWTManager(app)
        for res, endpoint in admin_resources:
            app.route('/admin' + endpoint)(res)
        moment = Moment(app)
        app.jinja_env.globals.update(offer_format=offer_format)

    api = Api(app, default_mediatype='application/json; charset=utf-8')

    for res, endpoint in resources:
        api.add_resource(res, '/api' + endpoint)
    return app
