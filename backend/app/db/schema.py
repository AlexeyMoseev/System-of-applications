from app.db import db, postgres, OrderStatus
from datetime import datetime

class Client(db.Model):
    #Включаем поддержку последовательностей, если это postgres
    if postgres:
        CLIENT_ID = db.Sequence('client_id_seq', start=1000)
    __tablename__ = 'client'
    id = db.Column(db.Integer, 
        CLIENT_ID if postgres else None, 
        primary_key=True, 
        server_default=CLIENT_ID.next_value() if postgres else None)
    email = db.Column(db.String, nullable=False, unique=True)
    password_hash = db.Column(db.String)
    #JSON данные {first_name: <имя>, last_name: <фамилия>}
    data = db.Column(db.JSON)
    #заказы клиента
    orders = db.relationship('Order', backref='client', lazy=True)

#Возможная услуга, которую клиент может закать.
class Offer(db.Model):
    __tablename__ = 'offer'
    id = db.Column(db.Integer, primary_key=True)
    #название услуги
    name = db.Column(db.String, nullable=False)
    #средняя продолжительность (по идее, из статистики), в секундах
    duration = db.Column(db.Integer)
    #опциональное описание услуги
    description_url = db.Column(db.String)
    #этапы, из которых состоит услуга
    steps = db.relationship('OfferStep', backref='offer', lazy=True)
    #нужно ли иметь явное подтверждение от админа,
    #что услуга доступна для клиента (см. OfferAvailability)?
    explicit_av_reqired = db.Column(db.Boolean, default=False)

#Этап услуги
class OfferStep(db.Model):
    __tablename__ = 'offer_step'
    __table_args__  = (db.UniqueConstraint('offer_id', 'number',
        name='_offer_id_number_uc'),)
    id = db.Column(db.Integer, primary_key=True)
    offer_id = db.Column(db.Integer, db.ForeignKey('offer.id'), nullable=False)
    #название этапа
    name = db.Column(db.String, nullable=False)
    #номер этапа (первый этап услуги - 0, второй - 1 и т.д.)
    number = db.Column(db.Integer, nullable=False)
    #средняя (по статистике) продолжительность в секундах
    duration = db.Column(db.Integer)

#Заказ услуги клиентом (т.е. заявка)
class Order(db.Model):
    __tablename__ = 'order'
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'),
        nullable=False)
    offer_id = db.Column(db.Integer, db.ForeignKey('offer.id'),
        nullable=False)
    #Номер заявки
    number = db.Column(db.Integer, nullable=False)
    #дата начала
    date_start = db.Column(db.DateTime, default=datetime.utcnow)
    #прогнозируемая (если не окончена) либо фактическая дата окончания
    date_end = db.Column(db.DateTime)
    #статус услуги:
    #  processing - в процессе;
    #  completed - завершена;
    #  rejected - отклонена.
    status = db.Column(db.Enum(OrderStatus))
    #текущий выполняемый этап
    active_step = db.Column(db.Integer, default=0)
    #требуются ли действия пользователя, чтобы продолжить заявку?
    action_required = db.Column(db.Boolean, default=False)
    #этапы выполнения заявки
    steps = db.relationship('OrderStep', backref='order', lazy=True)
    #ссылка на услугу, которая была заказана
    data = db.relationship('Offer', lazy=True)

#этап выполнения заявки (ссылается на шаг услуги)
class OrderStep(db.Model):
    __tablename__ = 'order_step'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'),
        nullable=False)
    offer_step_id = db.Column(db.Integer, db.ForeignKey('offer_step.id'),
        nullable=False)
    date_start = db.Column(db.DateTime)
    #если требуется подтверждение пользователя, либо этап отклонен, то здесь
    #должна быть указана причина
    description = db.Column(db.String)
    #ссылка на шаг услуги, которая была заказана
    data = db.relationship('OfferStep', lazy=True)

#таблица доступности услуги для клиента
class OfferAvailability(db.Model):
    __tablename__ = 'offer_availability'
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'),
        primary_key=True, nullable=False)
    offer_id = db.Column(db.Integer, db.ForeignKey('offer.id'),
        primary_key=True, nullable=False)
    #доступна ли услуга?
    available = db.Column(db.Boolean, nullable=False, default=True)
    #услуга уже заказана?
    ordered = db.Column(db.Boolean, nullable=False, default=False)
    #если услуга недоступна, то здесь указывается причина
    na_description = db.Column(db.String)
    offer = db.relationship('Offer', lazy=True)

class Audit(db.Model):
    __tablename__ = 'audit'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    ip = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
