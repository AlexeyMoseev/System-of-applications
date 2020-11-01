from flask import render_template, jsonify, redirect, url_for, request, abort
from app.model.admin import offers, tasks as tasks_model
from app.model.client import get_profile, get_clients
import json

def home():
	return redirect(url_for('tasks'))

def tasks():
	# return jsonify(tasks_model.get_current_tasks())
	return render_template('tasks.html',
		tasks=tasks_model.get_current_tasks())

def audit():
	return render_template('audit.html', data=tasks_model.get_audit())

def client(uid):
	return render_template('client.html', data=get_profile(uid),
		tasks=tasks_model.get_client_tasks(uid))

def client_oa(uid):
	return render_template('client_oa.html', data=get_profile(uid),
		offers=offers.get_client_oa(uid),
		this_url=url_for('client_oa', uid=uid))

def allow_offer():
	offer_id = request.args.get('offer_id')
	client_id = request.args.get('client_id')
	red = request.args.get('redirect')
	if red == 'None': red = None
	offers.allow_offer(offer_id, client_id, request.environ['REMOTE_ADDR'])
	return redirect(request.args.get('redirect') or url_for('tasks'))

def deny_offer():
	offer_id = request.args.get('offer_id')
	client_id = request.args.get('client_id')
	red = request.args.get('redirect')
	if red == 'None': red = None
	message = request.args.get('message')

	if not message:
		return message_form('deny_offer', [('offer_id',  offer_id),
			('client_id', client_id), ('redirect', red)])

	offers.deny_offer(offer_id, client_id, message, request.environ['REMOTE_ADDR'])
	return redirect(request.args.get('redirect') or url_for('tasks'))

def clients():
	return render_template('clients.html', clients=get_clients())

def resolve_task():
	task_id = request.args.get('task_id')
	red = request.args.get('redirect')
	if red == 'None': red = None

	tasks_model.complete_task(task_id, request.environ['REMOTE_ADDR'])
	return redirect(red or url_for('tasks'))

def req_task():
	task_id = request.args.get('task_id')
	red = request.args.get('redirect')
	if red == 'None': red = None
	message = request.args.get('message')

	if not message:
		return message_form('req_task', [('task_id',  task_id), ('redirect', red)])

	tasks_model.request_action_task(task_id, message)
	return redirect(red or url_for('tasks'))

def reject_task():
	task_id = request.args.get('task_id')
	red = request.args.get('redirect')
	if red == 'None': red = None
	message = request.args.get('message')

	if not message:
		return message_form('reject_task', [('task_id',  task_id), ('redirect', red)])

	tasks_model.reject_task(task_id, message, request.environ['REMOTE_ADDR'])
	return redirect(red or url_for('tasks'))

def message_form(action_url, params):
	return render_template('message.html', action_url=url_for(action_url), params=params)


resources = [
(home, '/'),
(audit, '/audit'),
(clients, '/clients'),
(tasks, '/tasks'),
(resolve_task, '/task/resolve'),
(req_task, '/task/request'),
(reject_task, '/task/reject'),
(allow_offer, '/allow_offer'),
(deny_offer, '/deny_offer'),
(client, '/client/<int:uid>'),
(client_oa, '/client/<int:uid>/availability'),
]