from app.db import Client, Offer, Order, OfferAvailability, db, OrderStatus,\
OrderStep
from sqlalchemy.orm import joinedload
from sqlalchemy import and_
from datetime import datetime, timedelta

def get_clients():
    return Client.query.all()

def get_profile(uid):
    client = Client.query.with_entities(Client.id, Client.email, Client.data).filter_by(id=uid).first_or_404()
    return {"id": client.id, "email": client.email, "data": client.data}

def get_offers(uid):
    return db.session.query(Offer, OfferAvailability)\
    .outerjoin(OfferAvailability, and_(
        OfferAvailability.offer_id==Offer.id,
        OfferAvailability.client_id==uid)).all()


def get_orders(uid):
    return Order.query.filter_by(client_id=uid).all()


def create_order(uid, offer_id):
    offer, av = db.session.query(Offer, OfferAvailability)\
    .filter_by(id=offer_id).\
        outerjoin(OfferAvailability, and_(
            OfferAvailability.offer_id==offer_id,
            OfferAvailability.client_id==uid
        )).\
        first()
    if av != None and av.available == False:
        raise Exception('Услуга недоступна')
    if offer.explicit_av_reqired and (av == None or av.available == False):
        raise Exception(
            'Услуга недоступна: необходимо подтверждение администратора')

    number = Order.query.filter_by(client_id=uid).count() + 1
    date = datetime.utcnow()

    order = Order(client_id=uid, offer_id=offer_id, number=number,
        date_end=None if offer.duration == None else
         date + timedelta(seconds=offer.duration),
         status=OrderStatus.processing)
    db.session.add(order)

    if av == None:
        av = OfferAvailability(client_id=uid, offer_id=offer_id,
            available=False, ordered=True)
    else:
        av.available = False
        av.ordered = True
    db.session.add(av)

    osts = []
    date_start = date
    for step in offer.steps:
        osp = OrderStep(order_id=order.id, offer_step_id=step.id,
            date_start=date_start)
        osts.append(osp)
        date_start += timedelta(seconds=step.duration)\
            if step.duration != None and date != None\
            else None

    db.session.add_all(osts)
    db.session.commit()


def delete_order(order_id):
    OrderStep.query.filter_by(order_id=order_id).delete()
    query = Order.query.filter_by(id=order_id)
    order = query.first()
    if order:
        OfferAvailability.query.filter_by(offer_id=order.offer_id).delete()
    query.delete()
    db.session.commit()