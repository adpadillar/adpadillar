---
title: My experience in HackMTY 2022
description: We attended the largest student hackathon in Mexico, and won 3rd place. Here you can read more details about our project, our process and how we achieved a great result for our first hackathon in only 24 hours.
image: https://storage.googleapis.com/blog-axelpadilla.appspot.com/marktext%2Fimg%2FIMG_2495%202.jpeg
publishDate: "2022-09-13"
---

**We attended the largest student hackathon in Mexico, and won 3rd place. Here you can read more details about our project, our process and how we achieved a great result for our first hackathon in only 24 hours.**

## Introduction to hackathons

If you don't know what a hackathon is, don't worry, we didn't know either. I will try to get you up to speed as quickly as possible. A hackathon is a competition where usually teams of around four people compete to invent solutions to some real world problems brought by the event sponsors, which are normally multinational companies, by prototyping some kind of software or hardware device. These events are normally timed and can last anywhere between 24 and 72 hours, and with such tight deadlines, sleeping really does become a luxury.

## Our project

Now that you know what a hackathon is, lets talk about the project my team decided on building, starting by the problem it solves. The sponsor problem we decided on came from the local banking company _Banorte_. They wanted some help to retain their younger user base _(between 18 to 23 years old)_ because they where leaving them for good after approximately 3-6 months of using their services.

After looking at some data provided by Banorte, we decided that we wanted to add some sort of feature that no other banking app had. The feature had to be flashy to attract some of the younger audience, and also convenient and easy to use so we can keep this audience using our product. That's how we arrived at the idea of a facial recognition based transaction system. The main idea was that once you want to transfer some money to another user, instead of typing the user's account number, you could also use his face to find his account.

## How did we build it?

I don't want to get too technical, [the whole code is available here](https://github.com/mc1ovins/hack-mty-2022). Please mind the context, it was written with a strict deadline and various levels of sleep deprivation, while not knowing some of the technologies and learning them on the fly, so don't complain too hard about it's quality. In summary, we built two main pieces, a simple python backend that used [Flask](https://flask.palletsprojects.com/en/2.2.x/) and the [face-recognition](https://pypi.org/project/face-recognition/) module to decide whether two pictures where of the same people, and a [Next.js](https://nextjs.org/) frontend that would simulate the application and give us something to pitch.

The backend code is actually hilariously simple, as the libraries do most of the heavy lifting. It's so simple that I can actually show it right here:

```python
# backend/compare_faces.py
# https://github.com/mc1ovins/hack-mty-2022/blob/main/backend/compare_faces.py
import face_recognition


def compare_faces(image_1, image_2):
    im_1 = face_recognition.load_image_file(image_1)
    im_1_encoding = face_recognition.face_encodings(im_1)[0]

    im_2 = face_recognition.load_image_file(image_2)
    im_2_encoding = face_recognition.face_encodings(im_2)[0]

    results = face_recognition.compare_faces([im_1_encoding], im_2_encoding)

    return results[0]
```

This first function will basically take the paths to two images, compare them and return whether we think if both pictures contain the same person's face, or not.

```py
# backend/script.py
# https://github.com/mc1ovins/hack-mty-2022/blob/main/backend/script.py
from flask import Flask, Response
from flask import request
from compare_faces import compare_faces
import requests

app = Flask(__name__)


def download_image(url, filename):
    r = requests.get(url, stream=True)
    if r.status_code == 200:
        with open(f"./img/{filename}", 'wb') as f:
            for chunk in r:
                f.write(chunk)


@app.route("/")
def get_compare_faces():
    image1 = request.args.get('j')
    image2 = request.args.get('k')

    filename_1 = image1.split('=')[-1].lower()
    filename_2 = image2.split('=')[-1].lower()

    download_image(image1, f'{filename_1}.jpg')
    download_image(image2, f'{filename_2}.jpg')

    result = compare_faces(
        f"./img/{filename_1}.jpg", f"./img/{filename_2}.jpg")
    resp = Response(f"{result}", content_type="text/plain")
    resp.headers.add("Access-Control-Allow-Origin", "*")

    return resp


if __name__ == "__main__":
    from waitress import serve
    print("Server started!")
    serve(app, host="0.0.0.0", port=8080)
```

This second file is the Flask web server that exposed the API for it to be consumed by our frontend. The api took two parameters, `j` and `k`, both are url's that point to the images that we want to compare. We download the images, compare them and in the response we send back if the images contain the same person or not, as plain text _(don't do this please!)_

The consumption of this API on the frontend looked a little something like this:

```tsx
// pages/app/transfer.tsx
// https://github.com/mc1ovins/hack-mty-2022/blob/main/pages/app/transfer.tsx
const compareFaces = (user: userData, face_2: string) => {
  console.log(
    `Comparing ${user.persona.nombre_completo}, ${user.persona.autenticacion_facial} with ${face_2}`
  );
  // Make a request to the backend to compare the faces
  const fetchUrl = `http://127.0.0.1:5000/?j=${encodeURIComponent(
    user.persona.autenticacion_facial
  )}&k=${encodeURIComponent(face_2)}`;

  fetch(fetchUrl).then((res) =>
    res.text().then((data) => {
      const result = data === "True";
      if (result) {
        setReceiverData(user);
        setStep(2);
      } else {
        console.log("No match");
      }
      console.log(user.persona.nombre_completo, result, data);
    })
  );
};
```

Ironically the frontend code is a lot more complicated than the backend code, so I encourage you to look at the [Github repository](https://github.com/mc1ovins/hack-mty-2022) if you're interested in that. I wish you luck tho, when I wrote that code only god and me knew what it did, now only god knows.
