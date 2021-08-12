import base64
import json
from django.http import HttpRequest, HttpResponse
from django.shortcuts import render
import uuid


# Create your views here.
def index(request):
    return render(request, 'main/index.html')


def save_audio(request):
    data_str = request.body.decode('ascii')
    data = json.loads(data_str)['message']
    file_name = uuid.uuid4()
    wav_file = open(f"{file_name}.mp3", "wb")
    decode_string = base64.b64decode(data)
    wav_file.write(decode_string)

    return HttpResponse('Saved')
