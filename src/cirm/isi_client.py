# pip install globusonline-transfer-api-client


from globusonline.transfer import api_client
from datetime import datetime, timedelta
import json

# simple transfer betweent 2 endpoints that support auto activation
def simple_transfer():
  endpoint_1 = "kyle#kyle_cdn"
  endpoint_2 = "kyle#kyle-laptop"
  file_from = "/cfp.txt"
  file_to = "/~/C/globus_share/cfp2.txt"

  api, _ = api_client.create_client_from_args()

  # check information about endpoints
  code, reason, data = api.endpoint(endpoint_1)
  code, reason, data = api.endpoint(endpoint_2)

  # activate endpoint
  code, reason, result = api.endpoint_autoactivate(endpoint_1, if_expires_in=600)
  code, reason, result = api.endpoint_autoactivate(endpoint_2, if_expires_in=600)

  # look at contents of endpoint
  code, reason, data = api.endpoint_ls(endpoint_1, "/")
  print data
  code, reason, data = api.endpoint_ls(endpoint_2, "/")


  # start transfer
  code, message, data = api.transfer_submission_id()
  t = api_client.Transfer(data["value"], endpoint_1, endpoint_2, datetime.utcnow() + timedelta(minutes=10))
  t.add_item(file_from, file_to)
  code, reason, data = api.transfer(t)
  task_id = data["task_id"]

  # check all tasks
  status_code, status_message, data = api.tasksummary()
  # check submitted task
  code, reason, data = api.task(task_id)

# this is for more complicated transfers that need endpoints to be activated - first using username/password
def password_activation_transfer():
  endpoint_1 = "kyle#seattle"
  endpoint_2 = "kyle#kyle-laptop"
  file_from = "/~/file1.txt"  
  file_to = "/~/C/globus_share/file1-nanohub"
 
  api, _ = api_client.create_client_from_args()
  
  # get requirements for activation
  code, message, filled_requirements = api.endpoint_activation_requirements(endpoint_1)

  # set username/password and activate
  filled_requirements.set_requirement_value('myproxy', 'passphrase', 'PASSWORD')
  filled_requirements.set_requirement_value('myproxy', 'username', 'kyle')
  code, reason, result = api.endpoint_activate(endpoint_1, filled_requirements, if_expires_in=600)  

  # start transfer
  code, message, data = api.transfer_submission_id()
  t = api_client.Transfer(data["value"], endpoint_1, endpoint_2, datetime.utcnow() + timedelta(minutes=10))
  t.add_item(file_from, file_to)
  code, reason, data = api.transfer(t)
  task_id = data["task_id"]

simple_transfer()
#password_activation_transfer()

