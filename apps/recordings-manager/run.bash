ffmpeg -i rtmp://localhost:1935 \
  -max_interleave_delta 0 \
  -avoid_negative_ts make_zero \
  -fflags +genpts \
  -probesize 32 \
  -analyzeduration 0 \
  -af "silencedetect=n=-24dB:d=0.8,silenceremove=start_periods=1:start_duration=1:start_threshold=-24dB" \
  -f segment \
  -segment_time 0 \
  -reset_timestamps 1 \
  -c:v copy \
  -c:a aac -b:a 128k \
  "clips/clip_%03d.mp4"