"""
Simple YouTube Downloader Server - No FFmpeg Required
This version downloads single format files to avoid ffmpeg dependency
"""

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import yt_dlp
import os
import tempfile
import time
import random
import threading

app = Flask(__name__)
CORS(app)

# Create temp directory
TEMP_DIR = os.path.join(tempfile.gettempdir(), 'yt_downloader_simple')
os.makedirs(TEMP_DIR, exist_ok=True)

# Rate limiting
last_request_time = {}
request_lock = threading.Lock()

def check_rate_limit(ip_address):
    current_time = time.time()
    with request_lock:
        if ip_address in last_request_time:
            if current_time - last_request_time[ip_address] < 3:
                return False
        last_request_time[ip_address] = current_time
        return True

@app.route('/')
def home():
    return jsonify({
        'status': 'running',
        'message': 'Simple YouTube Downloader (No FFmpeg)',
        'note': 'Single format downloads only'
    })

@app.route('/download')
def download():
    # Rate limiting
    if not check_rate_limit(request.remote_addr):
        return jsonify({'error': 'Rate limit exceeded'}), 429
    
    video_id = request.args.get('videoId')
    quality = request.args.get('quality', 'best')
    
    if not video_id:
        return "No video ID provided", 400

    url = f"https://www.youtube.com/watch?v={video_id}"
    
    # Simple format selection without merging
    format_map = {
        '360p': 'best[height<=360][ext=mp4]',
        '480p': 'best[height<=480][ext=mp4]', 
        '720p': 'best[height<=720][ext=mp4]',
        '1080p': 'best[height<=1080][ext=mp4]',
        'best': 'best[ext=mp4]'
    }
    
    format_selector = format_map.get(quality, 'best[ext=mp4]')
    
    # Simple filename
    timestamp = int(time.time())
    output_file = os.path.join(TEMP_DIR, f"video_{video_id}_{quality}_{timestamp}.mp4")
    
    # Simple yt-dlp options
    ydl_opts = {
        'outtmpl': output_file,
        'format': format_selector,
        'quiet': True,
        'no_warnings': True,
        'prefer_ffmpeg': False,
        'abort_on_error': False,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
            
        if not os.path.exists(output_file):
            return "Download failed", 500
            
        response = send_file(output_file, as_attachment=True, download_name=f"video_{quality}.mp4")
        
        # Cleanup after delay
        def cleanup():
            time.sleep(30)
            try:
                if os.path.exists(output_file):
                    os.remove(output_file)
            except:
                pass
        
        threading.Thread(target=cleanup, daemon=True).start()
        return response
        
    except Exception as e:
        return f"Error: {str(e)}", 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
