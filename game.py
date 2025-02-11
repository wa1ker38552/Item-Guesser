from flask_socketio import SocketIO
from flask import render_template
from Levenshtein import ratio
from flask import request
from flask import Flask
from helpers import *
import random
import json

nouns = json.loads(open('nouns.json', 'r').read())
app = Flask(__name__)
socket = SocketIO(app)
index = {}

@app.route('/')
def app_index():
    return render_template('index.html')

@app.route('/game/15s')
def app_game_15s():
    return render_template('gamemode_time.html', time=15)

@app.route('/game/30s')
def app_game_30s():
    return render_template('gamemode_time.html', time=30)

@app.route('/game/60s')
def app_game_60s():
    return render_template('gamemode_time.html', time=60)

@app.route('/game/sprint5')
def app_game_sprint5():
    return render_template('gamemode_sprint.html', amount=5)

@app.route('/game/sprint10')
def app_game_sprint10():
    return render_template('gamemode_sprint.html', amount=10)

@app.route('/game/sprint20')
def app_game_sprint20():
    return render_template('gamemode_sprint.html', amount=20)

@app.route('/api/new')
def api_new():
    item = random.choice(nouns)
    image = random.choice(google_image_search(item)[:10])
    index[image] = {
        'item': item,
        'guesses': 0
    }
    return {'image': image}

@app.route('/api/validate', methods=['POST'])
def api_validate():
    data = request.get_json()
    image = data['image']
    guess = data['guess'].lower()
    key = index[image]['item'].lower()
    if image in index:
        if index[image]['item'].lower() == guess:
            score = index[image]['guesses']+1
            del index[image]
        else:
            index[image]['guesses']  = index[image]['guesses']+1
            score = index[image]['guesses']
        
        if score > 4:
            return {
                'success': True, 
                'similarity': ratio(key, guess),
                'solution': key,
                'score': 5-score
            }
        else:
            return {
                'success': key == guess, 
                'similarity': ratio(key, guess),
                'solution': None,
                'score': 5-score
            }
    return {'success': False}

socket.run(app, host='0.0.0.0', port=5006, debug=True)