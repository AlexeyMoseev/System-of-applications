from app.db import db
from app.model import client
from app.db import Client, Offer, Order, OfferStep, OrderStep,\
OrderStatus, OfferAvailability
from app import create_app
import json

app=create_app()
with app.app_context():
	db.drop_all()
	db.create_all()
	c = Client(email='hello')
	db.session.add(c)
	b = Offer(name='Кредиты', duration=10000)
	db.session.add(b)
	b2 = Offer(name='Гарантии')
	db.session.add(b2)
	db.session.add(Offer(name='Перевозки', explicit_av_reqired=True))
	db.session.commit()

	a1 = OfferStep(offer_id=b.id, name='Экспертиза', number=2, duration=360)
	a2 = OfferStep(offer_id=b.id, name='Принятие документов', number=3,
		duration=120)
	a3 = OfferStep(offer_id=b.id, name='Проверка заявки', number=1,
		duration=30)
	db.session.add(a1)
	db.session.add(a2)
	db.session.add(a3)
	
	count = Order.query.filter_by(client_id=c.id).count()
	order = Order(client_id=c.id, offer_id=b.id, number=count+1)
	db.session.add(order)
	db.session.commit()

	db.session.add(OrderStep(order_id=order.id, offer_step_id=a1.id))
	db.session.add(OrderStep(order_id=order.id, offer_step_id=a2.id))
	db.session.add(OrderStep(order_id=order.id, offer_step_id=a3.id))

	db.session.add(OfferAvailability(client_id=c.id, offer_id=b.id,
		available=True, na_description='Удали'))
	db.session.add(OfferAvailability(client_id=c.id, offer_id=b2.id,
		available=False, na_description='Я так захотел.'))
	db.session.commit()
	# print(json.dumps(offer.get_orders(1), indent=2, ensure_ascii=False, 
	# 	default=str))
	# print(json.dumps(offer.get_offers(1), indent=2, ensure_ascii=False, 
	# 	default=str))
	# offer.create_order(1, 1)