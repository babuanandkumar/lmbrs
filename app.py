from flask import Flask, redirect, url_for, render_template, request, session, jsonify
import json
import decimal
import os
import biz


app = Flask(__name__)
app.secret_key = os.urandom(24)
# app.config["SESSION_PERMANENT"] = True
# app.config["SESSION_TYPE"] = "filesystem"


with app.app_context():
    biz.init()


class Encoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal): return float(obj)

# #@app.before_first_request
# def load_app_data():
#     biz.init()


def is_session_valid(page):
    print("**** Is Session Valid ==> ", str(page), ("user_profile" in session.keys() and not session["user_profile"] is None))
    return "user_profile" in session.keys() and not session["user_profile"] is None


@app.route("/")
def home(msg = None):
    return render_template("login.html", success = (msg if not msg is None and len(msg) > 0 else ""))


@app.route("/login", methods = ['POST'])
def login():
    session.clear()
    user_profile = biz.get_logon_profile(request.values.get("txt_user"), request.values.get("txt_pwd"))
    print("After Login. User Profile :" + str(user_profile))
    if user_profile is not None:
        if user_profile["status_id"] != 1: return render_template("login.html", error="User Inactive / Suspended")
        else:
            biz.update_last_logon(user_profile["id"])
            session["user_profile"] = user_profile
            return list_books()
    else: return render_template("login.html", error = "Invalid Credentials. Please try again")


@app.route("/books", methods = ['POST'])
def list_books():
    if not is_session_valid("/books"): return home()
    user_profile = session["user_profile"]
    languages = biz.get_all_languages()
    return render_template("list_books.html",
                           user_name = user_profile["f_name"].strip() + ", " + user_profile["l_name"].strip(),
                           languages = languages, start = 0)


@app.route("/recommendedbooks", methods = ['POST'])
def list_recommended_books():
    if not is_session_valid("/recommendedbooks"): return home()
    user_profile = session["user_profile"]
    languages = biz.get_all_languages()
    return render_template("recommended_books.html",
                           user_name = user_profile["f_name"].strip() + ", " + user_profile["l_name"].strip(),
                           languages = languages, start = 0)


@app.route("/getbooks", methods = ['POST'])
def get_books():
    start = request.values.get("start")
    lang_id = request.values.get("lang_id")
    order_by = request.values.get("order")
    search = request.values.get("search")
    limit = request.values.get("limit")
    recommended = request.values.get("recommended")
    if limit == "-1" or limit is None: limit = 20
    if not start: start = 0
    return json.dumps(biz.get_books(search, search, lang_id, order_by, int(start), limit, recommended), cls=Encoder)


@app.route("/getmemberbooks", methods = ['POST'])
def get_member_books():
    if not is_session_valid("/getmemberbooks"): return home()
    user_profile = session["user_profile"]
    person_id = user_profile["id"]
    return json.dumps(biz.get_member_books(person_id), cls=Encoder)


@app.route("/cancelborrow", methods = ['POST'])
def cancel_borrow():
    user_profile = session["user_profile"]
    book_copy_id = request.values.get("book_copy_id")
    person_id = user_profile["id"]
    biz.cancel_borrow(book_copy_id, person_id)
    return {"success": True, "book_copy_id": book_copy_id}


@app.route("/returnbook", methods = ['POST'])
def return_book():
    user_profile = session["user_profile"]
    book_copy_id = request.values.get("book_copy_id")
    person_id = user_profile["id"]
    biz.return_book(book_copy_id)
    return json.dumps({"success": True, "book_copy_id": book_copy_id})


@app.route("/borrowbook", methods = ['POST'])
def borrow_book():
    user_profile = session["user_profile"]
    book_id = request.values.get("book_id")
    borrowed = biz.borrow_if_available(book_id, user_profile["id"])
    return json.dumps({"status": borrowed, "book_id": book_id, "user_id": user_profile["id"]})


@app.route("/memberborrowals", methods = ['POST'])
def member_borrowals():
    if not is_session_valid("/memberborrowals"): return home()
    user_profile = session["user_profile"]
    return render_template("member_borrowals.html",
                           user_name=user_profile["f_name"].strip() + ", " + user_profile["l_name"].strip())


@app.route("/logout", methods = ['POST'])
def logout():
    # session["__invalidate__"] = True
    session.clear()
    return home("Logout Successful")