from flask_restful import Resource, reqparse, fields, marshal_with_field, marshal
from flask_jwt_extended import jwt_optional, jwt_required, get_jwt_identity
from app.model.client import get_offers, get_orders, create_order

p = reqparse.RequestParser()
p.add_argument('offer_id', type=int, required=True)

class Steps(fields.Raw):
    def format(self, value):
        data = list(dict(sorted({
            step.data.number: {
            'name': step.data.name,
            'date_start': step.date_start,
            'description': step.description
        } for step in value}.items())).values())
        return fields.List(fields.Nested({
                'name': fields.String,
                'date_start': fields.DateTime,
                'description': fields.String
            })).format(data)

order_fields = {
    'id': fields.Integer,
    'number': fields.Integer,
    'date_start': fields.DateTime,
    'date_end': fields.DateTime,
    'name': fields.String(attribute='data.name'),
    'status': fields.String(attribute='status.value'),
    'active_step': fields.Integer,
    'action_required': fields.Boolean,
    'steps': Steps
}

offer_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'duration': fields.Integer,
    'description_url': fields.String,
}

avdata_fields = {
    'ordered': fields.Boolean,
    'available': fields.Boolean,
    'na_description': fields.String,
}

class FieldsOffers(fields.Raw):
    def format(self, value):
        offer, avdata = value

        res = {**marshal(offer, offer_fields), **marshal(avdata, avdata_fields)}        

        if not avdata and offer.explicit_av_reqired:
            res['available'] = False
            res['na_description'] = 'Необходимо явное разрешение'
        return res
        

class Orders(Resource):
    @jwt_required
    @marshal_with_field(fields.List(fields.Nested(order_fields)))
    def get(self):
        return get_orders(get_jwt_identity())

    @jwt_required
    def post(self):
        args = p.parse_args()
        uid = get_jwt_identity()
        try:
            create_order(uid, args.offer_id)
            return {'error': None }
        except Exception as e:
            return {'error': str(e) }


class Offers(Resource):
    @jwt_optional
    @marshal_with_field(fields.List(FieldsOffers))
    def get(self):
        return get_offers(get_jwt_identity())
