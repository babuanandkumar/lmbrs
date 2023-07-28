from flask import Flask, redirect, url_for, render_template, request, session, jsonify
import json
import decimal
import os
import biz
import recommender


app = Flask(__name__)
app.secret_key = os.urandom(24)
# app.config["SESSION_PERMANENT"] = True
# app.config["SESSION_TYPE"] = "filesystem"


with app.app_context():
    biz.init()
    recommender.start()


class Encoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal): return float(obj)

def is_session_valid(page):
    print("**** Is Session Valid ==> ", str(page), ("user_profile" in session.keys() and not session["user_profile"] is None))
    return "user_profile" in session.keys() and not session["user_profile"] is None


def is_admin(profile):
    return "is_admin" in profile.keys() and profile["is_admin"] == 1



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
    if is_admin(user_profile):
        return render_template("list_books_admin.html",
                               user_name=user_profile["f_name"].strip() + ", " + user_profile["l_name"].strip(),
                               languages=languages, start=0, is_admin = True)
    else:
        return render_template("list_books_member.html",
                               user_name = user_profile["f_name"].strip() + ", " + user_profile["l_name"].strip(),
                               languages = languages, start = 0, is_admin = False)


@app.route("/recommendedbooks", methods = ['POST'])
def list_recommended_books():
    if not is_session_valid("/recommendedbooks"): return home()
    user_profile = session["user_profile"]
    languages = biz.get_all_languages()
    return render_template("recommended_books.html",
                           user_name = user_profile["f_name"].strip() + ", " + user_profile["l_name"].strip(),
                           languages = languages, start = 0)


@app.route("/getrecommendedbooks", methods = ['POST'])
def get_recommended_books():
    user_profile = session["user_profile"]
    book_ids = recommender.get_recommendation(user_profile["id"])
    return json.dumps(biz.get_recommended_books(book_ids), cls=Encoder)


@app.route("/getbooks", methods = ['POST'])
def get_books():
    start = request.values.get("start")
    lang_id = request.values.get("lang_id")
    order_by = request.values.get("order")
    search = request.values.get("search")
    limit = request.values.get("limit")
    recommended = request.values.get("recommended")
    if limit == "-1" or limit is None: limit = 20
    else: limit = int(limit)
    if not start: start = 0
    else: start = int(start)
    return json.dumps(biz.get_books(search, search, lang_id, order_by, start, limit, recommended), cls=Encoder)


@app.route("/getallmembersborrowalsadmin", methods = ['POST'])
def get_all_members_borrowals_admin():
    start = request.values.get("start")
    search = request.values.get("search")
    borrow_status = request.values.get("borrow_status")
    limit = request.values.get("limit")
    if limit == "-1" or limit is None: limit = 20
    else: limit = int(limit)
    if not start: start = 0
    else: start = int(start)
    if not borrow_status: borrow_status = 2
    borrow_status = int(borrow_status)
    return json.dumps(biz.get_all_members_books(search, search, search, borrow_status, start, limit), cls=Encoder)


@app.route("/getmemberbooks", methods = ['POST'])
def get_member_books():
    if not is_session_valid("/getmemberbooks"): return home()
    user_profile = session["user_profile"]
    person_id = user_profile["id"]
    return json.dumps(biz.get_member_books(person_id), cls=Encoder)


@app.route("/getmemberbooksadmin", methods = ['POST'])
def get_member_books_admin():
    if not is_session_valid("/getmemberbooksadmin"): return home()
    user_profile = session["user_profile"]
    if not is_admin(user_profile): return "Not Authorized"
    member_id = request.values.get("member_id")
    return json.dumps(biz.get_member_books(member_id), cls=Encoder)


@app.route("/cancelborrow", methods = ['POST'])
def cancel_borrow():
    user_profile = session["user_profile"]
    book_copy_id = request.values.get("book_copy_id")
    person_id = user_profile["id"]
    status = biz.cancel_borrow(book_copy_id, person_id)
    return {"success": status, "book_copy_id": book_copy_id}


@app.route("/returnbook", methods = ['POST'])
def return_book():
    user_profile = session["user_profile"]
    book_copy_id = request.values.get("book_copy_id")
    status = biz.update_book_copy_status(1, book_copy_id)
    return json.dumps({"success": status, "book_copy_id": book_copy_id})


@app.route("/updatebookcopyavailability", methods = ['POST'])
def update_book_copy_availability():
    user_profile = session["user_profile"]
    if not is_admin(user_profile): return "Not Authorized"
    book_copy_id = request.values.get("book_copy_id")
    book_status = request.values.get("book_status")
    member_id = request.values.get("member_id")
    book_status = int(book_status)
    status = biz.update_book_copy_status(book_status, book_copy_id)
    return json.dumps({"success": status, "book_copy_id": book_copy_id, "member_id": member_id})


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



@app.route("/showmembers", methods = ['POST'])
def show_members():
    if not is_session_valid("/showmembers"): return home()
    user_profile = session["user_profile"]
    if not is_admin(user_profile): return "Not Authorized"
    return render_template("list_members.html",
                           user_name=user_profile["f_name"].strip() + ", " + user_profile["l_name"].strip())


@app.route("/getmembers", methods = ['POST'])
def get_members():
    user_profile = session["user_profile"]
    if not is_admin(user_profile): return "Not Authorized"
    return json.dumps(biz.get_members(), cls=Encoder)


@app.route("/adminaddcopies", methods = ['POST'])
def add_copies():
    user_profile = session["user_profile"]
    book_id = request.values.get("book_id")
    num_copies = request.values.get("num_copies")
    if not is_admin(user_profile):
        return json.dumps({"status": False, "book_id": book_id, "num_copies": num_copies, "error": "Not authorized"})
    try:
        num_copies = int(num_copies)
    except:
        return json.dumps({"status": False, "book_id": book_id, "num_copies": num_copies, "error": "Number of copies specified is not a number"})
    added = biz.add_copies(book_id, num_copies)
    return json.dumps({"status": added, "book_id": book_id, "num_copies": num_copies})


@app.route("/memberbooksadmin", methods = ['POST'])
def show_member_books_admin():
    user_profile = session["user_profile"]
    if not is_admin(user_profile): return "Not Authorized"
    member_id = request.values.get("memberId")
    if member_id is None or len(member_id.strip()) == 0:
        return show_members()
    member_profile = biz.get_member_profile(member_id)
    if not member_profile is None:
        return render_template("member_borrowals_admin.html",
                           user_name=user_profile["f_name"].strip() + ", " + user_profile["l_name"].strip(),
                           member_name=member_profile["f_name"].strip() + ", " + member_profile["l_name"].strip(),
                           member_id = member_id)


@app.route("/allborrowals", methods = ['POST'])
def all_borrowals():
    if not is_session_valid("/allborrowals"): return home()
    user_profile = session["user_profile"]
    if not is_admin(user_profile): return "Not Authorized"
    return render_template("all_members_borrowals_admin.html",
                           user_name=user_profile["f_name"].strip() + ", " + user_profile["l_name"].strip())


@app.route("/logout", methods = ['POST'])
def logout():
    # session["__invalidate__"] = True
    session.clear()
    return home("Logout Successful")