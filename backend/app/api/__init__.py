from .client.login import Register, Login, ClientProfile
from .client.offers import Offers, Orders

resources = [
(ClientProfile, '/profile.json'),
(Login, '/login.json'),
(Register, '/register.json'),
(Offers, '/offers.json'),
(Orders, '/orders.json')
]