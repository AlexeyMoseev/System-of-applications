# from sqlalchemy import desc
from app.model import client
from app.db import db, Client, Order, OrderStep, OrderStatus,\
OfferStep, OfferAvailability, Audit
from collections import OrderedDict
from datetime import datetime, timedelta

def get_audit():
	return Audit.query.order_by(Audit.date.desc()).all()

def get_current_tasks():
	orders = Order.query.filter_by(status=OrderStatus.processing).\
	filter_by(action_required=False)

	tasks = []

	for order in orders:
		astep = next((step for step in order.steps
			if step.data.number == order.active_step),None)

		if astep != None:
			tasks.append({
				'id': astep.id,
				'client': { 'id': order.client.id,
					**order.client.data },
				'task_name': order.data.name,
				'date_start': astep.date_start,
				'name': astep.data.name})

	return sorted(tasks, key=lambda x: x['date_start'])

def get_client_tasks(uid):
	orders = Order.query.filter_by(status=OrderStatus.processing).\
	filter_by(client_id=uid)

	tasks = []

	for order in orders:
		astep = next((step for step in order.steps
			if step.data.number == order.active_step),None)

		if astep != None:
			tasks.append({
				'id': astep.id,
				'action_required': order.action_required,
				'description': astep.description,
				'task_name': order.data.name,
				'date_start': astep.date_start,
				'name': astep.data.name})

	return sorted(tasks, key=lambda x: not x['action_required'])

def request_action_task(task_id, description):
	task = OrderStep.query.filter_by(id=task_id).first()
	if task == None:
		return
	task.description = description
	order = task.order
	order.action_required = True
	db.session.add_all([task, order])
	db.session.commit()


def continue_task(task_id):
	task = OrderStep.query.filter_by(id=task_id).first()
	if task == None:
		return

	task.description = None
	order = task.order
	order.action_required = False
	order.status = OrderStatus.processing

	db.session.add_all([task, order])
	db.session.commit()


def complete_task(task_id, admin):
	task = OrderStep.query.filter_by(id=task_id).first()
	if task == None:
		return

	task.description = None
	order = task.order
	order.action_required = False
	order.status = OrderStatus.processing

	order.active_step += 1
	astep = order.active_step
	cur_date = datetime.utcnow()
	if astep < len(order.steps):
		date = cur_date
		for i in range(astep, len(order.steps)):
			st = order.steps[i]
			st.date_start = date
			date += timedelta(seconds=st.data.duration)
	else:
		order.status = OrderStatus.completed
		order.date_end = cur_date

	aud = Audit(ip=admin, description="выполнена задача %s" % task_id)

	db.session.add_all([task, order, aud])
	db.session.commit()


def reject_task(task_id, description, admin):
	task = OrderStep.query.filter_by(id=task_id).first()
	if task == None:
		return
	task.description = description
	order = task.order
	order.action_required = False
	order.status = OrderStatus.rejected
	astep = order.active_step
	for i in range(astep + 1, len(order.steps)):
		order.steps[i].date_start = None

	aud = Audit(ip=admin, description="отклонена задача %s: %s" %
		(task_id, description))
	db.session.add_all([task, order, aud])
	db.session.commit()


def test3():
	from app.model.client import delete_order
	for i in range(0, 20):
		delete_order(i)

def test2():
	# reject_task(9, 'Соэалею')
	complete_task(30)

def test1():
	for task in get_current_tasks()	:
		print(task)

if __name__ == "__main__":
	from app import create_app
	app=create_app()
	with app.app_context():
		# db.drop_all()
		# db.create_all()
		# c = Client(email='hello')
		# db.session.add(c)
		# db.session.commit()
		# test1()
		test3()
		# for task in get_client_tasks(4):
			# print(task)
		# test1()
		# test2()