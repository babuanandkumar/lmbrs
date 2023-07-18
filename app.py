from flask import Flask, redirect, url_for, render_template, request, session, jsonify
import json
import decimal
import os
import biz


app = Flask(__name__)
app.secret_key = os.urandom(24)

with app.app_context():
    biz.init()


class Encoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal): return float(obj)

# #@app.before_first_request
# def load_app_data():
#     biz.init()


@app.route("/")
def home():
    return render_template("login.html")


@app.route("/login", methods = ['POST'])
def login():
    user_profile = biz.get_logon_profile(request.values.get("txt_user"), request.values.get("txt_pwd"))
    if user_profile is not None:
        if user_profile["status_id"] != 1: return render_template("login.html", error="User Inactive / Suspended")
        else:
            biz.update_last_logon(user_profile["id"])
            session["user_profile"] = user_profile
            return list_books()
    else: return render_template("login.html", error = "Invalid Credentials. Please try again")


@app.route("/books", methods = ['POST'])
def list_books():
    user_profile = session["user_profile"]
    return render_template("list_books.html",
                           user_name = user_profile["f_name"].strip() + ", " + user_profile["l_name"].strip(),
                           start = 0)


@app.route("/getbooks", methods = ['POST'])
def get_books():
    key = request.values.get("key")
    start = request.values.get("start")
    print("Start Received :" + str(start))
    if not start: start = 0
    if key == "NEW_PUB":
        return json.dumps(biz.get_new_publications(int(start), 20), cls=Encoder)


@app.route("/logout")
def logout():
    session["__invalidate__"] = True
    return render_template("login.html", message = "You have been logged out successfully")