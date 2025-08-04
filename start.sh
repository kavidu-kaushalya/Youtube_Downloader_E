#!/bin/bash

# Install ffmpeg for Railway deployment
apt-get update
apt-get install -y ffmpeg

# Start the application
python server.py
