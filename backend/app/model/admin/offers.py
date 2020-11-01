from app.model import client
from app.db import db, Client, Offer, OfferStep, OfferAvailability, Audit
from sqlalchemy import and_

def add_offer(data):
	count = 0
	sum_dur = 0
	steps = []
	for sdata in data['steps']:
		dur = sdata.get('duration')
		steps.append(OfferStep(name=sdata.get('name'),
			number=count, duration=dur))
		sum_dur += dur
		count+=1

	offer = Offer(name=data.get('name'),
		description_url=data.get('description_url'),
		duration=sum_dur,
		explicit_av_reqired=data.get('explicit_av_reqired'))
	db.session.add(offer)
	db.session.flush()
	for step in steps:
		step.offer_id = offer.id
		db.session.add(step)
	db.session.commit()


def get_client_oa(client_id):
	return db.session.query(Offer, OfferAvailability).\
	outerjoin(OfferAvailability, and_(OfferAvailability.offer_id==Offer.id,
		OfferAvailability.client_id==client_id)).all()

def allow_offer(offer_id, client_id, admin):
	oa = OfferAvailability.query.filter_by(client_id=client_id,
		offer_id=offer_id).first()
	if oa != None:
		oa.available = True
		oa.na_description = None
	else:
		oa = OfferAvailability(client_id=client_id,
			offer_id=offer_id,
			available=True, na_description=None)
	aud = Audit(ip=admin, description="разрешена услуга %s для %s" %
		(offer_id, client_id))
	db.session.add_all([oa, aud])
	db.session.commit()

def deny_offer(offer_id, client_id, na_description, admin):
	oa = OfferAvailability.query.filter_by(client_id=client_id,
		offer_id=offer_id).first()
	if oa != None:
		oa.available = False
		oa.na_description = na_description
	else:
		oa = OfferAvailability(client_id=client_id,
			offer_id=offer_id,
			available=False, na_description=na_description)
	aud = Audit(ip=admin, description="запрещена услуга %s для %s: %s" %
		(offer_id, client_id, na_description))
	db.session.add_all([oa, aud])
	db.session.commit()


def test2():
	allow_offer(3, 3)
	# deny_offer(1, 1, 'Нельзя')

def test1():
	data = [{
	'name': 'Получение кредитов',
	'description_url': 'https://ru.wikipedia.org/wiki/Банковский_кредит',
	'steps': [{
		'name': 'Проверка заявки',
		'duration': 3600
	},
	{
		'name': 'Подготовка к выдаче',
		'duration': 20000,
	},
	{
		'name': 'Выдача кредита',
		'duration': 7200
	}]},
	{
	'name': 'Юридические услуги',
	'steps': [{
		'name': 'Первый этап',
		'duration': 1000
	},
	{
		'name': 'И другой этап',
		'duration': 10000
	}]
	}]
	for d in data:
		add_offer(d)

if __name__ == "__main__":
	from app import create_app
	app=create_app()
	with app.app_context():
		# db.drop_all()
		# db.create_all()
		# c = Client(email='hello')
		# db.session.add(c)
		# db.session.commit()
		ofs = get_client_oa(4)

		# test1()
		# test1()
		# test2()
