from flask_sqlalchemy import SQLAlchemy
import json
import os
import enum

def dumps(d):
    return json.dumps(d, ensure_ascii=False)

def loads(d):
    return json.loads(d, encoding='utf-8')

class OrderStatus(enum.Enum):
    processing = 'processing'
    completed = 'completed'
    rejected = 'rejected'

class SQLPostgresAlchemy(SQLAlchemy):
    def apply_driver_hacks(self, app, info, options):
        options.update({
            'json_serializer':dumps,
            'json_deserializer':loads
            # 'isolation_level': 'AUTOCOMMIT', 
            # 'encoding': 'latin1', 
            # 'echo': True

        })
        super(SQLPostgresAlchemy, self).apply_driver_hacks(app, info, options)

postgres = os.environ['DATABASE'].startswith('postgres')
db = SQLPostgresAlchemy() if postgres else SQLAlchemy()
from .schema import *