from flask import Flask, redirect, url_for, render_template, request, session
import os
import biz


app = Flask(__name__)
app.secret_key = os.urandom(24)



#@app.before_first_request
def load_app_data():
    biz.init()


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
            return new_publications()
    else: return render_template("login.html", error = "Invalid Credentials. Please try again")


@app.route("/newpublications", methods = ['POST'])
def new_publications():
    user_profile = session["user_profile"]
    new_publications = biz.get_new_publications(20)
    return render_template("new_publications.html",
                           user_name = user_profile["f_name"].strip() + ", " + user_profile["l_name"].strip(),
                           new_publications = new_publications)


@app.route("/logout")
def logout():
    session["__invalidate__"] = True
    return render_template("login.html", message = "You have been logged out successfully")