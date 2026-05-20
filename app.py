import os
from flask import Flask, Response, jsonify, request, send_from_directory
import time
from solvers.nqueens import min_conflit_steps
from solvers.sudoku import min_conflict_sudoku, backtrack_sudoku, SUDOKU_PUZZLES

app = Flask(__name__, static_folder='static', static_url_path='')
EXTENSION_ROOT = os.path.join(app.root_path, 'browser-extension')

def render_extension_document(filename):
    path = os.path.join(EXTENSION_ROOT, filename)
    with open(path, 'r', encoding='utf-8') as handle:
        html = handle.read()
    if '<head>' in html:
        html = html.replace('<head>', '<head>\n    <base href="/extension/">', 1)
    return Response(html, mimetype='text/html')

@app.route('/')
def landing():
    return send_from_directory(app.static_folder, 'landing.html')

@app.route('/app')
def app_page():
    return send_from_directory(app.static_folder, 'app.html')

@app.route('/extension')
def extension_app():
    return render_extension_document('app.html')

@app.route('/extension-popup')
def extension_popup():
    return render_extension_document('popup.html')

@app.route('/extension/<path:filename>')
def extension_static(filename):
    return send_from_directory(EXTENSION_ROOT, filename)

@app.route('/extension-showcase')
def extension_showcase():
    return send_from_directory(app.static_folder, 'extension-showcase.html')

@app.route('/extension-privacy')
def extension_privacy():
    return send_from_directory(app.static_folder, 'extension-privacy.html')

@app.route('/health')
def health():
    return jsonify({'status': 'ok'})

@app.route('/solve', methods=['POST'])
def solve():
    data = request.get_json()
    n = data.get('n', 20)
    max_steps = data.get('max_steps', 500)
    start = time.perf_counter()
    states = min_conflit_steps(n, max_steps)
    elapsed = time.perf_counter() - start
    return jsonify({
        'states': states,
        'solved': states[-1]['total_conflicts'] == 0,
        'steps': len(states) - 1,
        'time': elapsed
    })

@app.route('/solve-sudoku', methods=['POST'])
def solve_sudoku():
    data = request.get_json()
    grid = data.get('grid')
    method = data.get('method', 'backtrack')
    start = time.perf_counter()
    if method == 'minconf':
        states = min_conflict_sudoku(grid, timeout=30)
    else:
        states = backtrack_sudoku(grid)
    elapsed = time.perf_counter() - start
    solved = states[-1].get('solved', False) if states else False
    return jsonify({
        'states': states,
        'solved': solved,
        'steps': len(states) - 1,
        'time': elapsed
    })

@app.route('/benchmark', methods=['GET'])
def benchmark():
    tailles = [8, 16, 32, 64, 128, 256, 512, 1000]
    results = []
    debut = time.perf_counter()
    for n in tailles:
        if time.perf_counter() - debut > 15:
            break
        succes = 0
        temps_total = 0
        etapes_moy = 0
        essais = 10
        for _ in range(essais):
            t0 = time.perf_counter()
            states = min_conflit_steps(n, 200)
            t1 = time.perf_counter() - t0
            if states[-1]['total_conflicts'] == 0:
                succes += 1
                etapes_moy += len(states) - 1
            temps_total += t1
        results.append({
            'n': n,
            'success_rate': succes / essais * 100,
            'avg_time_ms': (temps_total / essais) * 1000,
            'avg_steps': etapes_moy / succes if succes else 0
        })
    return jsonify(results)

@app.route('/benchmark-sudoku', methods=['GET'])
def benchmark_sudoku():
    method = request.args.get('method', 'backtrack')
    difficulties = {
        'easy': SUDOKU_PUZZLES['easy'],
        'medium': SUDOKU_PUZZLES['medium'],
        'hard': SUDOKU_PUZZLES['hard'],
        'expert': SUDOKU_PUZZLES['expert']
    }
    results = []
    for name, grid in difficulties.items():
        start = time.perf_counter()
        if method == 'minconf':
            states = min_conflict_sudoku(grid, timeout=10)
        else:
            states = backtrack_sudoku(grid)
        elapsed = time.perf_counter() - start
        solved = states[-1].get('solved', False) if states else False
        steps = len(states) - 1 if states else 0
        results.append({
            'difficulty': name,
            'solved': solved,
            'time_ms': elapsed * 1000,
            'steps': steps
        })
    return jsonify(results)

if __name__ == '__main__':
    host = os.getenv('APP_HOST', '127.0.0.1')
    port = int(os.getenv('APP_PORT', '5000'))
    debug = os.getenv('APP_DEBUG', '1').lower() in ('1', 'true', 'yes', 'on')
    print(f"Serveur sur http://{host}:{port}")
    # Keep auto-reload in development without relying on Werkzeug's
    # interactive debugger, which can hang on some Windows/Python setups.
    app.run(debug=debug, host=host, use_debugger=False, port=port)
