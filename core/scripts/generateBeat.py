import json
def generate_beats(bpm, duration):
    # Calculate time per beat
    time_per_beat = 60000 / bpm

    # Generate an array of beats for 30 seconds
    beats_array = [time_per_beat * i for i in range(int(duration / time_per_beat))]

    # Multiply each beat by 48
    final_array = [round(beat * 48) for beat in beats_array]

    return json.dumps(beats_array, separators=(',', ':'))

print(generate_beats(int(input('bpm : ')), int(input('duration in ms : '))))
input()