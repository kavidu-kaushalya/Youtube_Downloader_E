from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import yt_dlp
import os
import tempfile
import shutil
import atexit
from datetime import datetime, timedelta
import threading
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create a dedicated temp directory for downloads
TEMP_DIR = os.path.join(tempfile.gettempdir(), 'yt_downloader')
os.makedirs(TEMP_DIR, exist_ok=True)

# Keep track of temporary files for cleanup
temp_files = set()
temp_files_lock = threading.Lock()

def cleanup_old_files():
    """Clean up files older than 1 hour"""
    try:
        current_time = time.time()
        with temp_files_lock:
            files_to_remove = set()
            for file_path in temp_files.copy():
                try:
                    if os.path.exists(file_path):
                        # Remove files older than 1 hour
                        if current_time - os.path.getctime(file_path) > 3600:
                            os.remove(file_path)
                            files_to_remove.add(file_path)
                            print(f"Cleaned up old file: {file_path}")
                    else:
                        files_to_remove.add(file_path)
                except Exception as e:
                    print(f"Error cleaning up {file_path}: {e}")
                    files_to_remove.add(file_path)
            
            temp_files -= files_to_remove
    except Exception as e:
        print(f"Error in cleanup_old_files: {e}")

def cleanup_thread():
    """Background thread to periodically clean up old files"""
    while True:
        time.sleep(300)  # Run every 5 minutes
        cleanup_old_files()

# Start cleanup thread
cleanup_daemon = threading.Thread(target=cleanup_thread, daemon=True)
cleanup_daemon.start()

# Cleanup on exit
def cleanup_on_exit():
    """Clean up all temp files on exit"""
    try:
        with temp_files_lock:
            for file_path in temp_files.copy():
                try:
                    if os.path.exists(file_path):
                        os.remove(file_path)
                        print(f"Exit cleanup: {file_path}")
                except Exception as e:
                    print(f"Exit cleanup error for {file_path}: {e}")
        
        # Remove temp directory if empty
        try:
            if os.path.exists(TEMP_DIR) and not os.listdir(TEMP_DIR):
                os.rmdir(TEMP_DIR)
        except Exception as e:
            print(f"Error removing temp directory: {e}")
    except Exception as e:
        print(f"Error in cleanup_on_exit: {e}")

atexit.register(cleanup_on_exit)

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/')
def home():
    """Simple test endpoint"""
    return jsonify({
        'status': 'running',
        'message': 'YouTube Downloader Server is running',
        'endpoints': [
            '/video-info?videoId=<id>',
            '/download?videoId=<id>&quality=<quality>',
            '/qualities'
        ]
    })

@app.route('/qualities')
def get_qualities():
    """Return available quality options"""
    qualities = {
        '360p': '360p quality',
        '480p': '480p quality', 
        '720p': '720p HD quality',
        '1080p': '1080p Full HD quality',
        'best': 'Best available quality'
    }
    return jsonify(qualities)

@app.route('/video-info')
def get_video_info():
    """Get video information including available formats and sizes"""
    video_id = request.args.get('videoId')
    
    if not video_id:
        return jsonify({'error': 'No video ID provided'}), 400

    url = f"https://www.youtube.com/watch?v={video_id}"
    
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"Fetching info for video: {video_id}")
            info = ydl.extract_info(url, download=False)
            
            video_info = {
                'title': info.get('title', ''),
                'duration': info.get('duration', 0),
                'qualities': {}
            }
            
            # If we can't get exact sizes, provide estimates based on duration and quality
            duration_minutes = info.get('duration', 180) / 60  # Default to 3 minutes if unknown
            
            # Rough size estimates based on typical bitrates (in MB)
            quality_estimates = {
                '360p': duration_minutes * 5,    # ~5 MB per minute
                '480p': duration_minutes * 8,    # ~8 MB per minute
                '720p': duration_minutes * 15,   # ~15 MB per minute
                '1080p': duration_minutes * 25   # ~25 MB per minute
            }
            
            for quality, estimated_mb in quality_estimates.items():
                estimated_mb = round(estimated_mb, 1)
                estimated_bytes = int(estimated_mb * 1024 * 1024)
                
                # Format size properly
                if estimated_mb < 1024:
                    size_formatted = f"{estimated_mb} MB"
                else:
                    size_formatted = f"{round(estimated_mb/1024, 1)} GB"
                
                video_info['qualities'][quality] = {
                    'size_bytes': estimated_bytes,
                    'size_mb': estimated_mb,
                    'size_formatted': size_formatted,
                    'estimated': True  # Mark as estimated
                }
            
            print(f"Video qualities data: {video_info['qualities']}")
            print(f"Successfully processed video info for: {video_info['title']}")
            return jsonify(video_info)
            
    except Exception as e:
        print(f"Error in video-info endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to get video info: {str(e)}'}), 500

@app.route('/download')
def download():
    video_id = request.args.get('videoId')
    quality = request.args.get('quality', 'best')  # Default to best quality
    
    if not video_id:
        return "No video ID provided", 400

    url = f"https://www.youtube.com/watch?v={video_id}"
    
    # Get video title first
    try:
        with yt_dlp.YoutubeDL({'quiet': True}) as ydl:
            info = ydl.extract_info(url, download=False)
            video_title = info.get('title', video_id)
            # Clean filename - remove invalid characters
            video_title = "".join(c for c in video_title if c.isalnum() or c in (' ', '-', '_')).rstrip()
            # Replace spaces with underscores and limit length
            video_title = video_title.replace(' ', '_')[:50]
    except Exception as e:
        print(f"Could not extract video title: {e}")
        video_title = video_id
    
    # Create unique filename with timestamp to avoid conflicts
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = os.path.join(TEMP_DIR, f"{video_title}_{quality}_{timestamp}.mp4")
    
    # Add to temp files tracking
    with temp_files_lock:
        temp_files.add(output_file)

    # Quality format mapping
    quality_formats = {
        '360p': 'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360][ext=mp4]/best[ext=mp4]',
        '480p': 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best[ext=mp4]',
        '720p': 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[ext=mp4]',
        '1080p': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best[ext=mp4]',
        'best': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/mp4'
    }
    
    # Get format string based on quality selection
    format_selector = quality_formats.get(quality, quality_formats['best'])

    ydl_opts = {
        'outtmpl': output_file,
        'format': format_selector,
        'merge_output_format': 'mp4',
        'quiet': False,  # Enable output for debugging
        'no_warnings': False
    }

    try:
        # Clean up any existing file first
        if os.path.exists(output_file):
            os.remove(output_file)
            
        print(f"Starting download for video ID: {video_id} with quality: {quality}")
        print(f"Video title: {video_title}")
        print(f"URL: {url}")
        print(f"Output file: {output_file}")
        print(f"Format selector: {format_selector}")
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
            
        # Verify file was created
        if not os.path.exists(output_file):
            return "Error: Download completed but file not found", 500
            
        # Check file size
        file_size = os.path.getsize(output_file)
        if file_size == 0:
            os.remove(output_file)
            return "Error: Downloaded file is empty", 500
            
        print(f"Download successful. File size: {file_size} bytes")
        
    except yt_dlp.DownloadError as e:
        return f"YouTube download error: {str(e)}", 500
    except Exception as e:
        return f"Error downloading video: {str(e)}", 500

    try:
        response = send_file(output_file, as_attachment=True, download_name=f"{video_title}_{quality}.mp4")
        
        # Schedule file cleanup after a delay to ensure download completes
        def delayed_cleanup():
            time.sleep(30)  # Wait 30 seconds for download to complete
            try:
                if os.path.exists(output_file):
                    os.remove(output_file)
                    print(f"Cleaned up temp file: {output_file}")
                with temp_files_lock:
                    temp_files.discard(output_file)
            except Exception as cleanup_error:
                print(f"Delayed cleanup error: {cleanup_error}")
        
        # Start cleanup thread
        cleanup_thread = threading.Thread(target=delayed_cleanup, daemon=True)
        cleanup_thread.start()

        return response
    except Exception as e:
        # Clean up file if send_file fails
        try:
            if os.path.exists(output_file):
                os.remove(output_file)
            with temp_files_lock:
                temp_files.discard(output_file)
        except Exception as cleanup_error:
            print(f"Error cleanup failed: {cleanup_error}")
        return f"Error sending file: {str(e)}", 500

if __name__ == "__main__":
    print("Starting YouTube Downloader Server...")
    port = int(os.environ.get("PORT", 5000))
    host = os.environ.get("HOST", "0.0.0.0")
    debug_mode = os.environ.get("DEBUG", "False").lower() == "true"
    
    print(f"Server will run on http://{host}:{port}")
    print(f"Temporary files will be stored in: {TEMP_DIR}")
    print("Automatic cleanup: Files older than 1 hour will be removed every 5 minutes")
    print("Available endpoints:")
    print("  - GET /video-info?videoId=<id> - Get video information")
    print("  - GET /download?videoId=<id>&quality=<quality> - Download video")
    print("  - GET /qualities - Get available quality options")
    
    app.run(host=host, port=port, debug=debug_mode)
